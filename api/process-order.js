const redNumbers = ['01','02','07','08','12','13','18','19','23','24','29','30','34','35','40','45','46'];
const blueNumbers = ['03','04','09','10','14','15','20','25','26','31','36','37','41','42','47','48'];
const greenNumbers = ['05','06','11','16','17','21','22','27','28','32','33','38','39','43','44','49'];
const zodiacOrder = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊'];
const startZodiac = '马';

function getZodiac(num) {
  const idx = zodiacOrder.indexOf(startZodiac);
  return zodiacOrder[(idx + parseInt(num) - 1) % 12];
}

function parseOrderLine(line) {
  const match = line.match(/([\u4e00-\u9fa5\d\-]+)\s+各数\s+(\d+)/);
  if (!match) return { numbers: [], amount: 0 };
  const content = match[1];
  const amount = parseInt(match[2]) || 0;
  const items = content.split('-').filter(i => i.trim());
  const numbers = new Set();
  items.forEach(item => {
    if (/^\d{1,2}$/.test(item)) {
      const num = item.padStart(2, '0');
      if (parseInt(num) >= 1 && parseInt(num) <= 49) numbers.add(num);
    }
  });
  return { numbers: [...numbers], amount };
}

export async function onRequest(context) {
  const request = context.request;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const body = await request.json();
    const { orders, rebateRate = 4, multiple = 47 } = body;
    if (!Array.isArray(orders)) {
      return new Response(JSON.stringify({ error: 'orders 必须为数组' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = {};
    let totalBet = 0;
    orders.forEach(line => {
      const { numbers, amount } = parseOrderLine(line);
      if (numbers.length === 0) return;
      numbers.forEach(num => {
        data[num] = (data[num] || 0) + amount;
        totalBet += amount;
      });
    });

    const rebate = (totalBet * rebateRate) / 100;
    const riskList = [];
    for (let i = 1; i <= 49; i++) {
      const num = i.toString().padStart(2, '0');
      const bet = data[num] || 0;
      const risk = Math.round(totalBet - bet * multiple - rebate);
      riskList.push({
        number: num,
        zodiac: getZodiac(num),
        bet,
        risk,
        color: redNumbers.includes(num) ? 'red' : (blueNumbers.includes(num) ? 'blue' : 'green')
      });
    }
    riskList.sort((a, b) => b.bet - a.bet);

    return new Response(JSON.stringify({ totalBet, rebate: rebate.toFixed(2), riskList }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
