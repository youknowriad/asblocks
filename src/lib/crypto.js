import {
	genAESKey,
	exportKey,
	importKey,
	encrypt as parentEncrypt,
	decrypt as parentDecrypt,
} from 'easy-web-crypto';

export async function generateKey() {
	return await genAESKey();
}

export async function keyToString( key ) {
	return ( await exportKey( key, 'jwk' ) ).k;
}

export async function stringToKey( string ) {
	const jwk = {
		alg: 'A128GCM',
		ext: true,
		k: string,
		key_ops: [ 'encrypt', 'decrypt' ],
		kty: 'oct',
	};

	return await importKey( jwk, 'jwk' );
}

export async function encrypt( data, key ) {
	return await parentEncrypt( key, data );
}

export async function decrypt( encrypted, key ) {
	return await parentDecrypt( key, encrypted );
}
