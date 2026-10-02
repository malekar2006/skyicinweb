const allowedCurrencies = new Set(['USD', 'YER', 'SAR']);
const allowedTypes = new Set(['tourism', 'hajj', 'umrah', 'hotel', 'transport', 'visa', 'insurance', 'other']);

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const body = req.body ?? {};
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const serviceType = typeof body.serviceType === 'string' ? body.serviceType : '';
  const currency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'USD';

  if (fullName.length < 2 || fullName.length > 120) return res.status(400).json({ error: 'invalid_full_name' });
  if (phone.length < 7 || phone.length > 30) return res.status(400).json({ error: 'invalid_phone' });
  if (!allowedTypes.has(serviceType)) return res.status(400).json({ error: 'invalid_service_type' });
  if (!allowedCurrencies.has(currency)) return res.status(400).json({ error: 'invalid_currency' });

  return res.status(202).json({ accepted: true, message: 'تم استلام طلبك وسيتم التواصل معك.', baseCurrency: 'USD' });
}
