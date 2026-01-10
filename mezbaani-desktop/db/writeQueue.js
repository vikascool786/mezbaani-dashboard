let chain = Promise.resolve();

function queueWrite(fn) {
  chain = chain.then(() => {
    return new Promise((resolve, reject) => {
      try {
        const result = fn();
        console.log("sync checking-->", result);
        resolve(result);
      } catch (err) {
        console.error("SQLite write error:", err);
        reject(err);
      }
    });
  });
  return chain;
}

module.exports = { queueWrite };