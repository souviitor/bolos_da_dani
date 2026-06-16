// src/app/api/pix/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') ?? '0');

    const [pixKeySetting, pixNameSetting] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'pix_key' } }),
      prisma.settings.findUnique({ where: { key: 'pix_name' } }),
    ]);

    const pixKey  = pixKeySetting?.value  ?? '+5511999999999';
    const pixName = pixNameSetting?.value ?? 'Bolos da Dani';

    // Generate PIX EMV payload (simplified static PIX)
    const pixPayload = generatePixPayload(pixKey, pixName, amount);

    // Generate QR Code as Data URL
    const qrCode = await QRCode.toDataURL(pixPayload, {
      width:           400,
      margin:          2,
      color: { dark: '#2C1810', light: '#FDF6EE' },
    });

    return NextResponse.json({ qrCode, pixKey: pixPayload, pixName });
  } catch (error) {
    console.error('PIX error:', error);
    return NextResponse.json({ error: 'Failed to generate PIX' }, { status: 500 });
  }
}

function generatePixPayload(key: string, name: string, amount: number): string {
  const merchantName  = name.slice(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const merchantCity  = 'SAO PAULO';
  const amountStr     = amount > 0 ? amount.toFixed(2) : '';

  function tlv(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  const gui         = tlv('00', 'BR.GOV.BCB.PIX');
  const keyField    = tlv('01', key);
  const merchantAccount = tlv('26', gui + keyField);

  const payloadFields = [
    tlv('00', '01'),               // Payload Format
    merchantAccount,               // Merchant Account
    tlv('52', '0000'),             // Merchant Category Code
    tlv('53', '986'),              // Transaction Currency (BRL)
    ...(amountStr ? [tlv('54', amountStr)] : []),
    tlv('58', 'BR'),               // Country Code
    tlv('59', merchantName),       // Merchant Name
    tlv('60', merchantCity),       // Merchant City
    tlv('62', tlv('05', '***')),   // Additional Data
  ];

  const partial = payloadFields.join('');
  const withCRC = partial + '6304';

  // CRC16-CCITT
  let crc = 0xFFFF;
  for (const char of withCRC) {
    crc ^= char.charCodeAt(0) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
  }
  const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');

  return withCRC + crcHex;
}
