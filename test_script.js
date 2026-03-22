fetch('http://localhost:3000/api/execute-python', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: `
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title('Sine Wave')
plt.show()
`
  })
}).then(res => res.json()).then(data => {
  console.log("Response keys:", Object.keys(data));
  if (data.base64) {
    console.log("Base64 string starts with:", data.base64.substring(0, 50));
  } else {
    console.log("Error:", data);
  }
}).catch(console.error);
