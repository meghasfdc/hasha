'use strict';
const fs = require('fs');
const crypto = require('crypto');
const isStream = require('is-stream');

const hasha = (input, options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const hash = crypto.createHash(options.algorithm || 'sha512');

	const update = buffer => {
		const inputEncoding = typeof buffer === 'string' ? 'utf8' : undefined;
		hash.update(buffer, inputEncoding);
	};

	if (Array.isArray(input)) {
		input.forEach(update);
	} else {
		update(input);
	}

	return hash.digest(outputEncoding);
};

hasha.stream = (options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const stream = crypto.createHash(options.algorithm || 'sha512');
	stream.setEncoding(outputEncoding);
	return stream;
};

hasha.fromStream = (stream, options = {}) => {
	if (!isStream(stream)) {
		return Promise.reject(new TypeError('Expected a stream'));
	}

	return new Promise((resolve, reject) => {
		stream
			.on('error', reject)
			.pipe(hasha.stream(options))
			.on('error', reject)
			.on('finish', function () {
				resolve(this.read());
			});
	});
};

hasha.fromFile = (filePath, options) => hasha.fromStream(fs.createReadStream(filePath), options);

hasha.fromFileSync = (filePath, options) => hasha(fs.readFileSync(filePath), options);

module.exports = hasha;
