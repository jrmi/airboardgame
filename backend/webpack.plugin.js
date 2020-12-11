const crypto = require("crypto");
const { RawSource } = require("webpack-sources");

class EncryptPlugin {
  constructor({ algorithm = "aes-256-cbc", key }) {
    this.algorithm = algorithm;
    this.key = key;
  }

  encrypt(buffer, key, algorithm) {
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, "base64"),
      iv
    );
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      iv: iv.toString("base64"),
      encryptedData: encrypted.toString("base64"),
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("EncryptPlugin", (compilation) => {
      compilation.hooks.afterProcessAssets.tap("EncryptPlugin", () => {
        console.log("Encrypt setup.js content.");
        compilation.updateAsset("setup.js", (rawSource) => {
          return new RawSource(
            JSON.stringify(
              this.encrypt(rawSource.buffer(), this.key, this.algorithm)
            )
          );
        });
      });
    });
  }
}

module.exports = EncryptPlugin;
