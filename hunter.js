const Hunter = require("hunterio");
require("dotenv").config();

const client = new Hunter("c001a7aedb82af052e0e19148dc39a27d1360652");

function filterResponse(data) {
  const filteredData = {
    status: data.result,
    email: data.email,
    mx_records: data.mx_records,
    smtp_server: data.smtp_server,
  };
  return filteredData;
}

client.emailVerifier(
  {
    email: "mohamedhathim@adyog.com",
  },
  (err, result) => {
    if (err) {
      console.error("Error verifying email:", err);
    } else {
      if (result && result.data) {
        const filteredResult = filterResponse(result.data);
        console.log(
          "Filtered email verification result with options:",
          filteredResult
        );
      } else {
        console.error("Unexpected response format:", result);
      }
    }
  }
);
