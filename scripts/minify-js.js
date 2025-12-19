/**
 * JavaScript Minification Script
 * Minifies all JavaScript files for production
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const JS_DIR = path.join(__dirname, '../public/js');
const OUTPUT_DIR = path.join(__dirname, '../public/js/min');

// Terser options for optimal minification
const terserOptions = {
    compress: {
        dead_code: true,
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        keep_classnames: true,
        keep_fnames: false,
        passes: 2
    },
    mangle: {
        keep_classnames: true,
        keep_fnames: false
    },
    format: {
        comments: false,
        preamble: '/* HLPFL Forms - Optimized */'
    },
    sourceMap: {
        filename: 'bundle.min.js',
        url: 'bundle.min.js.map'
    }
};

async function minifyFile(filePath, outputPath) {
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const result = await minify(code, terserOptions);
        
        if (result.error) {
            console.error(`❌ Error minifying ${filePath}:`, result.error);
            return false;
        }
        
        fs.writeFileSync(outputPath, result.code);
        
        const originalSize = Buffer.byteLength(code, 'utf8');
        const minifiedSize = Buffer.byteLength(result.code, 'utf8');
        const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(2);
        
        console.log(`✅ ${path.basename(filePath)}: ${formatBytes(originalSize)} → ${formatBytes(minifiedSize)} (${savings}% smaller)`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function minifyAllFiles() {
    console.log('🚀 Starting JavaScript minification...\n');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Get all JS files
    const files = fs.readdirSync(JS_DIR)
        .filter(file => file.endsWith('.js') && !file.endsWith('.min.js'));
    
    let successCount = 0;
    let totalOriginalSize = 0;
    let totalMinifiedSize = 0;
    
    for (const file of files) {
        const inputPath = path.join(JS_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, file.replace('.js', '.min.js'));
        
        const originalSize = fs.statSync(inputPath).size;
        const success = await minifyFile(inputPath, outputPath);
        
        if (success) {
            successCount++;
            const minifiedSize = fs.statSync(outputPath).size;
            totalOriginalSize += originalSize;
            totalMinifiedSize += minifiedSize;
        }
    }
    
    console.log('\n📊 Minification Summary:');
    console.log(`✅ Successfully minified: ${successCount}/${files.length} files`);
    console.log(`📦 Total original size: ${formatBytes(totalOriginalSize)}`);
    console.log(`📦 Total minified size: ${formatBytes(totalMinifiedSize)}`);
    console.log(`💾 Total savings: ${formatBytes(totalOriginalSize - totalMinifiedSize)} (${((1 - totalMinifiedSize / totalOriginalSize) * 100).toFixed(2)}%)`);
    console.log(`\n✨ Minified files saved to: ${OUTPUT_DIR}`);
}

// Run minification
minifyAllFiles().catch(error => {
    console.error('❌ Minification failed:', error);
    process.exit(1);
});