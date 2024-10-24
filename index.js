const dgram = require("node:dgram");
const dnsPacket = require("dns-packet");

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
  const incomingMsg = dnsPacket.decode(msg);
  const db = {
    "aniruddh.com": {
      type: "A",
      data: "1.2.3.4",
    },
    "blog.aniruddh.com": {
      type: "CNAME",
      data: "www.aniruddhparwal.com",
    },
  };
  const ipFromDb = db[incomingMsg.questions[0].name];

  const ans = dnsPacket.encode({
    type: "response",
    id: incomingMsg.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingMsg.questions,
    answers: [
      {
        type: ipFromDb.type,
        class: "IN",
        name: incomingMsg.questions[0].name,
        data: ipFromDb.data,
      },
    ],
  });

  server.send(ans, rinfo.port, rinfo.address);
  // console.log({
  //   msg: msg.toString(),
  //   incomingMsg: incomingMsg.questions[0].name,
  //   ipFromDb,
  //   rinfo,
  // });
});

server.bind(53, () => console.log("Server is up"));
