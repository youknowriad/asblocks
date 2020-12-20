const { app, BrowserWindow } = require( 'electron' );
const { resolve } = require( 'path' );

function createWindow() {
	const win = new BrowserWindow( {
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
		},
	} );

	win.loadFile( resolve( __dirname, 'dist/index.html' ) );
}

app.whenReady().then( createWindow );

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

app.on( 'activate', () => {
	if ( BrowserWindow.getAllWindows().length === 0 ) {
		createWindow();
	}
} );
