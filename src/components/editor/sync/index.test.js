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

const getUpdatedBlocksUsingDeprecatedAlgo = (
	originalBlocks,
	updatedLocalBlocks,
	updatedRemoteBlocks
) => {
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
};

function applyYjsChange( yDoc, callback, origin ) {
	const promise = new Promise( ( resolve ) => {
		yDoc.on( 'update', () => {
			resolve();
		} );
	} );
	yDoc.transact( callback, origin );

	return promise;
}

async function getUpdatedBlocksUsingYjsAlgo(
	originalBlocks,
	updatedLocalBlocks,
	updatedRemoteBlocks
) {
	// local doc
	const localYDoc = new yjs.Doc();
	const localYBlocks = localYDoc.getMap( 'blocks' );
	localYBlocks.set( 'order', new yjs.Map() );
	localYBlocks.set( 'byClientId', new yjs.Map() );
	await applyYjsChange(
		localYDoc,
		() => {
			setYDocBlocks( localYBlocks, originalBlocks );
		},
		1
	);
	if ( originalBlocks !== updatedLocalBlocks ) {
		await applyYjsChange(
			localYDoc,
			() => {
				setYDocBlocks( localYBlocks, updatedLocalBlocks );
			},
			1
		);
	}

	// remote doc
	const remoteYDoc = new yjs.Doc();
	const remoteYBlocks = remoteYDoc.getMap( 'blocks' );
	remoteYBlocks.set( 'order', new yjs.Map() );
	remoteYBlocks.set( 'byClientId', new yjs.Map() );
	await applyYjsChange(
		remoteYDoc,
		() => {
			setYDocBlocks( remoteYBlocks, originalBlocks );
		},
		2
	);
	if ( originalBlocks !== updatedRemoteBlocks ) {
		await applyYjsChange(
			remoteYDoc,
			() => {
				setYDocBlocks( remoteYBlocks, updatedRemoteBlocks );
			},
			2
		);
	}
	const remoteState = yjs.encodeStateAsUpdate( remoteYDoc );

	// Merging docs
	await applyYjsChange(
		localYDoc,
		() => {
			yjs.applyUpdate( localYDoc, remoteState );
		},
		2
	);

	return yDocBlocksToArray( localYBlocks );
}

[
	{ name: 'original algorithm', algo: getUpdatedBlocksUsingDeprecatedAlgo },
	{ name: 'yjs', algo: getUpdatedBlocksUsingYjsAlgo },
].forEach( ( { name, algo } ) => {
	describe( name + ': Conflicts', () => {
		test( 'should return the update block', async () => {
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

		test( 'should add a new block and edited an existing one', async () => {
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

		test( 'should add a new block and edited an existing one', async () => {
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
	} );
} );
