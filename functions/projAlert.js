exports = async function ({ query, headers, body }, response) {
  const url =
    "https://chat.googleapis.com/v1/spaces/5jSEyMAAAAE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=VzRzLeDRrusFUQN4LGlb6NpVEftgRuJAAU897OJfKfA";

  let res = await context.http.post({
    url: url,
    headers: {
      "Content-Type": ["application/json; charset=UTF-8"],
    },
    body: JSON.stringify({ text: JSON.parse(body.text()).humanReadable }),
  });

  console.log(JSON.stringify(EJSON.parse(res.body.text())));

  return { success: true };
};
