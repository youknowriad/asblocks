import WebCrypto from 'easy-web-crypto';

export async function generateKey() {
	const encryptionKey = await WebCrypto.genAESKey();
	return {
		encryptionKey,
		encryptionKeyString: await keyToString( encryptionKey ),
	};
}

export async function keyToString( key ) {
	return ( await WebCrypto.exportKey( key, 'jwk' ) ).k;
}

export async function stringToKey( string ) {
	const jwk = {
		alg: 'A128GCM',
		ext: true,
		k: string,
		key_ops: [ 'encrypt', 'decrypt' ],
		kty: 'oct',
	};

	return await WebCrypto.importKey( jwk, 'jwk' );
}

export async function encrypt( data, key ) {
	return await WebCrypto.encrypt( key, data );
}

export async function decrypt( encrypted, key ) {
	return await WebCrypto.decrypt( key, encrypted );
}
