fetch('http://localhost:3000/api/telegram-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageUrl: "https://example.com/telegram-test.png",
    userId: "telegram_user_123",
    title: "Telegram Test Problem",
    problemFormalization: "Solve for x in Telegram",
  })
}).then(res => res.json()).then(data => {
  console.log("Telegram API Response:", data);
}).catch(console.error);
