const fs = require('fs');
const path = require('path');

/**
 * @example "/Users/jwork/Documents/git/wilty"
 */
const projectPath = path.dirname(__dirname);
const publicPath = path.resolve(projectPath, "public");

/**
 * sirv-cli strictly serves index.html when visiting http://localhost:5000, so with this symlink we
 * ensure that any accidental visits to this address are still served our built index file.
 * public/index.html -> public/build/index.html
 */
try {
    fs.unlinkSync(path.resolve(publicPath, 'index.html'));
} catch (error) {
    if (error.code === "ENOENT") {
        // Already removed, or missing in the first place.
    } else {
        throw error;
    }
}
fs.symlinkSync('build/index.html', /* <- */ path.resolve(publicPath, 'index.html'), 'file');

