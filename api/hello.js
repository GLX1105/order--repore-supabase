export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: '后端运行成功！',
    time: new Date().toISOString()
  });
}
