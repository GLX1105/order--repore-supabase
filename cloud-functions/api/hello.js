export async function onRequest(context) {
  return new Response(JSON.stringify({
    message: '后端启动成功！',
    time: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
