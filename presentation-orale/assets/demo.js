// Simple JavaScript function for demonstration
function greet(name) {
    return `Hello, ${name}! Welcome to CodePrez presentation.`;
}

function showProjectStats() {
    const stats = {
        linesOfCode: 2500,
        files: 45,
        technologies: ['Vue.js', 'Electron', 'Node.js', 'Vite'],
        features: [
            'Markdown parsing',
            'Code execution',
            'Interactive slides',
            'Asset management'
        ]
    };

    console.log('📊 Project Statistics:');
    console.log(`📄 Files: ${stats.files}`);
    console.log(`📝 Lines of code: ${stats.linesOfCode}`);
    console.log(`🔧 Technologies: ${stats.technologies.join(', ')}`);
    console.log(`⚡ Features: ${stats.features.length} main features`);

    return stats;
}

// Export for potential use
module.exports = { greet, showProjectStats };
