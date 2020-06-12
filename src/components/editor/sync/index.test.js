import * as yjs from 'yjs';
import {
	getDeletedBlocks,
	getBlockVersions,
	getPositionVersions,
	mergeBlocks,
} from './deprecated';
import setYDocBlocks from './set-y-doc-blocks';
import yDocBlocksToArray from './y-doc-blocks-to-array';

jest.mock( 'uuid', () => {
	let i = 0;
	// This ensures nonces are generated in a consistent way.
	return { v4: () => i-- };
} );

async function getUpdatedBlocksUsingDeprecatedAlgo(
	originalBlocks,
	updatedLocalBlocks,
	updatedRemoteBlocks
) {
	// Original Data
	const originalBlockVersions = getBlockVersions( {}, [], originalBlocks );
	const originalPositionVersions = getPositionVersions(
		{},
		[],
		originalBlocks
	);

	// Local Data
	const localDeletedBlocks = getDeletedBlocks(
		originalBlocks,
		updatedLocalBlocks
	);
	const localBlockVersions = getBlockVersions(
		originalBlockVersions,
		originalBlocks,
		updatedLocalBlocks
	);
	const localPositionVersions = getPositionVersions(
		originalPositionVersions,
		originalBlocks,
		updatedLocalBlocks
	);

	// Remote data
	const remoteDeletedBlocks = getDeletedBlocks(
		originalBlocks,
		updatedRemoteBlocks
	);
	const remoteBlockVersions = getBlockVersions(
		originalBlockVersions,
		originalBlocks,
		updatedRemoteBlocks
	);
	const remotePositionVersions = getPositionVersions(
		originalPositionVersions,
		originalBlocks,
		updatedRemoteBlocks
	);

	const mergedBlocks = mergeBlocks(
		updatedLocalBlocks,
		updatedRemoteBlocks,
		localBlockVersions,
		remoteBlockVersions,
		localPositionVersions,
		remotePositionVersions,
		{
			...localDeletedBlocks,
			...remoteDeletedBlocks,
		}
	);

	return mergedBlocks.blocks;
}

function applyYjsTransaction( yDoc, callback, origin ) {
	return new Promise( ( resolve ) => {
		yDoc.on( 'update', () => {
			resolve();
		} );
		yDoc.transact( callback, origin );
	} );
}
function applyYjsUpdate( yDoc, update ) {
	return new Promise( ( resolve ) => {
		yDoc.on( 'update', () => {
			resolve();
		} );
		yjs.applyUpdate( yDoc, update );
	} );
}

async function getUpdatedBlocksUsingYjsAlgo(
	originalBlocks,
	updatedLocalBlocks,
	updatedRemoteBlocks
) {
	// Local doc.
	const localYDoc = new yjs.Doc();
	const localYBlocks = localYDoc.getMap( 'blocks' );
	await applyYjsTransaction(
		localYDoc,
		() => {
			localYBlocks.set( 'order', new yjs.Map() );
			localYBlocks.set( 'byClientId', new yjs.Map() );
		},
		1
	);

	// Remote doc.
	const remoteYDoc = new yjs.Doc();
	const remoteYBlocks = remoteYDoc.getMap( 'blocks' );
	await applyYjsTransaction(
		localYDoc,
		() => {
			localYBlocks.set( 'order', new yjs.Map() );
			localYBlocks.set( 'byClientId', new yjs.Map() );
		},
		1
	);

	// Initialize both docs to the original blocks.
	await applyYjsTransaction(
		localYDoc,
		() => {
			setYDocBlocks( localYBlocks, originalBlocks );
		},
		1
	);
	await applyYjsUpdate( remoteYDoc, yjs.encodeStateAsUpdate( localYDoc ) );

	// Local edit.
	if ( originalBlocks !== updatedLocalBlocks ) {
		await applyYjsTransaction(
			localYDoc,
			() => {
				setYDocBlocks( localYBlocks, updatedLocalBlocks );
			},
			1
		);
	}

	// Remote edit.
	if ( originalBlocks !== updatedRemoteBlocks ) {
		await applyYjsTransaction(
			remoteYDoc,
			() => {
				setYDocBlocks( remoteYBlocks, updatedRemoteBlocks );
			},
			2
		);

		// Merging remote edit into local edit.
		await applyYjsUpdate(
			localYDoc,
			yjs.encodeStateAsUpdate( remoteYDoc )
		);
	}

	return yDocBlocksToArray( localYBlocks );
}

jest.useRealTimers();
[
	{ name: 'original algorithm', algo: getUpdatedBlocksUsingDeprecatedAlgo },
	{ name: 'yjs', algo: getUpdatedBlocksUsingYjsAlgo },
].forEach( ( { name, algo } ) => {
	describe( name + ': Conflict Resolution', () => {
		test( 'Remote update to single block.', async () => {
			const originalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];
			const updatedLocalBlocks = originalBlocks;

			const updateRemoteBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			expect(
				await algo(
					originalBlocks,
					updatedLocalBlocks,
					updateRemoteBlocks
				)
			).toEqual( updateRemoteBlocks );
		} );

		test( 'New local block and remote update to single block.', async () => {
			const originalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];
			const updatedLocalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'new',
					},
					innerBlocks: [],
				},
			];

			const updateRemoteBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			const expectedMerge = [
				{
					clientId: '1',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'new',
					},
					innerBlocks: [],
				},
			];

			expect(
				await algo(
					originalBlocks,
					updatedLocalBlocks,
					updateRemoteBlocks
				)
			).toEqual( expectedMerge );
		} );

		test( 'Local deletion of multiple blocks and update to single block.', async () => {
			const originalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '3',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];
			const updatedLocalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			const updateRemoteBlocks = originalBlocks;

			const expectedMerge = [
				{
					clientId: '1',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			expect(
				await algo(
					originalBlocks,
					updatedLocalBlocks,
					updateRemoteBlocks
				)
			).toEqual( expectedMerge );
		} );

		test( 'Moving a block locally while updating it remotely.', async () => {
			const originalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];
			const updatedLocalBlocks = [
				{
					clientId: '2',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];

			const updateRemoteBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			const expectedMerge = [
				{
					clientId: '2',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];

			expect(
				await algo(
					originalBlocks,
					updatedLocalBlocks,
					updateRemoteBlocks
				)
			).toEqual( expectedMerge );
		} );

		test( 'Moving a block to inner blocks while updating it remotely.', async () => {
			const originalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
			];
			const updatedLocalBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [
						{
							clientId: '2',
							attributes: {
								content: 'original',
							},
							innerBlocks: [],
						},
					],
				},
			];

			const updateRemoteBlocks = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [],
				},
				{
					clientId: '2',
					attributes: {
						content: 'updated',
					},
					innerBlocks: [],
				},
			];

			const expectedMerge = [
				{
					clientId: '1',
					attributes: {
						content: 'original',
					},
					innerBlocks: [
						{
							clientId: '2',
							attributes: {
								content: 'updated',
							},
							innerBlocks: [],
						},
					],
				},
			];

			expect(
				await algo(
					originalBlocks,
					updatedLocalBlocks,
					updateRemoteBlocks
				)
			).toEqual( expectedMerge );
		} );
	} );
} );
