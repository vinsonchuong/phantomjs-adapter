function count(total) {
  return new Promise((resolve) => {
    function loop(current) {
      if (current > 0) {
        process.stdout.write(`${current}...`);
        setTimeout(() => loop(current - 1), 1000);
      } else {
        resolve();
      }
    }
    loop(total);
  });
}

export default async function() {
  await count(3);
  process.stdout.write('Hello World!\n');
}
