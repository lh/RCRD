// deploy.js
const { exec } = require('child_process');
const path = require('path');

const execute = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, {
            maxBuffer: 1024 * 1024 * 10, // Increase buffer size to 10MB
            env: { ...process.env, NODE_OPTIONS: '--max_old_space_size=4096' }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
};

async function deploy() {
    try {
        // Ensure we're on develop branch
        await execute('git checkout develop');
        
        // Build the project
        console.log('Building project...');
        await execute('npm run build');
        
        // Create or clean temp directory
        const tempDir = path.join(__dirname, 'temp-deploy');
        await execute(`rm -rf ${tempDir}`);
        await execute(`mkdir ${tempDir}`);
        
        // Copy build files to temp directory
        console.log('Copying build files...');
        await execute(`cp -r build/* ${tempDir}`);
        
        // Switch to main branch
        await execute('git checkout main');
        
        // Remove old files (except .git)
        console.log('Cleaning main branch...');
        await execute('git rm -rf .');
        
        // Copy new build files
        console.log('Copying new files to main...');
        await execute(`cp -r ${tempDir}/* .`);
        
        // Add and commit changes
        await execute('git add .');
        await execute('git commit -m "Deploy to GitHub Pages"');
        
        // Push to main
        console.log('Pushing to main branch...');
        await execute('git push origin main');
        
        // Clean up and switch back to develop
        await execute(`rm -rf ${tempDir}`);
        await execute('git checkout develop');
        
        console.log('Deployment completed successfully!');
    } catch (error) {
        console.error('Deployment failed:', error);
        // Cleanup and return to develop branch
        await execute('git checkout develop');
        throw error;
    }
}

deploy();