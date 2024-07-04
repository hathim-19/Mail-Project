const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const net = require("net");
const dns = require("dns");

app.post("/checkemail", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  async function verifyEmail(email) {
    const domain = email.split("@")[1];

    try {
      const mxRecords = await getMxRecords(domain);
      if (mxRecords.length === 0) {
        throw new Error("No MX records found");
      }

      for (const mx of mxRecords) {
        const isValid = await checkSmtp(email, mx.exchange);
        if (isValid) {
          return { email, domain, status: "Email is valid" };
        }
      }

      return { email, domain, status: "Email is  invalid" };
    } catch (err) {
      console.error("Error during email verification:", err);
      return { email, domain, status: "Email is  invalid" };
    }
  }
  function getMxRecords(domain) {
    return new Promise((resolve, reject) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err) {
          return reject(err);
        }
        addresses.sort((a, b) => a.priority - b.priority);
        resolve(addresses);
      });
    });
  }
  function checkSmtp(email, mxHost) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(25, mxHost);
      let response = "";
      let isValid = false;

      socket.setEncoding("utf8");

      socket.on("connect", () => {
        socket.write("HELO smtp.gmail.com\r\n");
        socket.write(`MAIL FROM:<sample@gmail.com>\r\n`);
        socket.write(`RCPT TO:<${email}>\r\n`);
        socket.write("QUIT\r\n");
      });

      socket.on("data", (data) => {
        response += data.toString();
        if (response.includes("250")) {
          isValid = true;
        }
        if (response.includes("550")) {
          isValid = false;
          socket.end();
        }
      });

      socket.on("end", () => {
        resolve(isValid);
      });

      socket.on("error", (err) => {
        reject(err);
      });

      socket.on("close", () => {
        resolve(isValid);
      });
    });
  }

  // const emailToVerify = "vetrivel.annadurai@gmail.com";
  verifyEmail(email)
    .then((message) => res.status(200).json({ message }))
    .catch((error) => res.status(400).json({ error }));
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
