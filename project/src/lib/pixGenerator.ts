function crc16ccitt(str: string): number {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xffff;
  }
  return crc;
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixPayload(
  pixKey: string,
  merchantName = 'IEQ Novos Começos',
  city = 'BELEM'
): string {
  const sanitizedName = merchantName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25)
    .toUpperCase();
  const sanitizedCity = city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15)
    .toUpperCase();

  const gui = tlv('00', 'br.gov.bcb.pix');
  const key = tlv('01', pixKey);
  const merchantAccountInfo = tlv('26', gui + key);

  const additionalData = tlv('62', tlv('05', '***'));

  let payload = '';
  payload += tlv('00', '01');
  payload += tlv('01', '12');
  payload += merchantAccountInfo;
  payload += tlv('52', '0000');
  payload += tlv('53', '986');
  payload += tlv('58', 'BR');
  payload += tlv('59', sanitizedName);
  payload += tlv('60', sanitizedCity);
  payload += additionalData;
  payload += '6304';

  const crc = crc16ccitt(payload);
  payload += crc.toString(16).toUpperCase().padStart(4, '0');

  return payload;
}
