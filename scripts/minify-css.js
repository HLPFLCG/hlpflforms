/**
 * CSS Minification Script
 * Minifies all CSS files for production
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

const CSS_DIR = path.join(__dirname, '../public/css');
const OUTPUT_DIR = path.join(__dirname, '../public/css/min');

// cssnano options for optimal minification
const cssnanoOptions = {
    preset: ['default', {
        discardComments: {
            removeAll: true
        },
        normalizeWhitespace: true,
        colormin: true,
        minifyFontValues: true,
        minifySelectors: true
    }]
};

async function minifyFile(filePath, outputPath) {
    try {
        const css = fs.readFileSync(filePath, 'utf8');
        const result = await postcss([cssnano(cssnanoOptions)]).process(css, {
            from: filePath,
            to: outputPath
        });
        
        fs.writeFileSync(outputPath, result.css);
        
        const originalSize = Buffer.byteLength(css, 'utf8');
        const minifiedSize = Buffer.byteLength(result.css, 'utf8');
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
    console.log('🎨 Starting CSS minification...\n');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Get all CSS files
    const files = fs.readdirSync(CSS_DIR)
        .filter(file => file.endsWith('.css') && !file.endsWith('.min.css'));
    
    let successCount = 0;
    let totalOriginalSize = 0;
    let totalMinifiedSize = 0;
    
    for (const file of files) {
        const inputPath = path.join(CSS_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, file.replace('.css', '.min.css'));
        
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