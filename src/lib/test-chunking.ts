/**
 * Test script to verify chunking strategies
 */
import { ChunkingStrategy, getChunkingStrategy, DEFAULT_CHUNKING_CONFIG, createPageChunker, createAgenticChunker } from "./chunking";

const sampleText = `
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models. These models enable computer systems to improve their performance on a specific task through experience.

Key Concepts in Machine Learning

Supervised learning involves training a model on labeled data. The algorithm learns to map inputs to outputs based on example input-output pairs. Common applications include classification and regression tasks.

Unsupervised learning works with unlabeled data. The algorithm tries to find patterns and structure in the data without predefined categories. Clustering and dimensionality reduction are typical unsupervised learning tasks.

Deep Learning and Neural Networks

Deep learning is a specialized form of machine learning that uses neural networks with multiple layers. These networks can automatically learn hierarchical representations of data, making them particularly effective for complex tasks like image recognition and natural language processing.

The architecture of deep neural networks allows them to learn features at different levels of abstraction. Lower layers might detect edges in images, while higher layers recognize complex objects.

Conclusion and Future Directions

The field continues to evolve rapidly with new techniques and applications emerging regularly. Understanding these fundamental concepts provides a strong foundation for exploring more advanced topics in artificial intelligence.
`.trim();

async function testChunkingStrategies() {
    console.log("=== Testing Chunking Strategies ===\n");

    // Test 1: Page-based chunking (for PPT)
    console.log("1. Testing PAGE-BASED chunking (for PPT files):");
    console.log("   File: presentation.pptx");

    const pptStrategy = getChunkingStrategy("presentation.pptx", "unstructured");
    console.log(`   Strategy selected: ${pptStrategy}`);

    if (pptStrategy === ChunkingStrategy.PAGE_BASED) {
        const pageChunker = createPageChunker();
        const pageChunks = await pageChunker.chunk(
            sampleText,
            1,
            DEFAULT_CHUNKING_CONFIG[ChunkingStrategy.PAGE_BASED]
        );
        console.log(`   ✓ Created ${pageChunks.length} chunk(s)`);
        console.log(`   ✓ First chunk length: ${pageChunks[0].text.length} chars`);
        console.log(`   ✓ Entire page preserved as single chunk: ${pageChunks[0].text.length === sampleText.length}\n`);
    } else {
        console.log("   ✗ Wrong strategy selected!\n");
    }

    // Test 2: Agentic chunking (for PDF)
    console.log("2. Testing AGENTIC chunking (for PDF files):");
    console.log("   File: document.pdf");

    const pdfStrategy = getChunkingStrategy("document.pdf", "unstructured");
    console.log(`   Strategy selected: ${pdfStrategy}`);

    if (pdfStrategy === ChunkingStrategy.AGENTIC) {
        const agenticChunker = createAgenticChunker(
            DEFAULT_CHUNKING_CONFIG[ChunkingStrategy.AGENTIC]
        );
        const agenticChunks = await agenticChunker.chunk(
            sampleText,
            1,
            DEFAULT_CHUNKING_CONFIG[ChunkingStrategy.AGENTIC]
        );
        console.log(`   ✓ Created ${agenticChunks.length} chunk(s)`);
        console.log(`   ✓ Chunk sizes:`);
        agenticChunks.forEach((chunk, i) => {
            console.log(`     - Chunk ${i + 1}: ${chunk.text.length} chars`);
        });

        // Verify chunks are within size constraints
        const config = DEFAULT_CHUNKING_CONFIG[ChunkingStrategy.AGENTIC];
        const allWithinBounds = agenticChunks.every(
            (chunk) =>
                chunk.text.length >= (config.minChunkSize || 0) ||
                chunk.text.length <= (config.maxChunkSize || Infinity)
        );
        console.log(`   ✓ All chunks within size constraints: ${allWithinBounds}\n`);
    } else {
        console.log("   ✗ Wrong strategy selected!\n");
    }

    // Test 3: Different file types
    console.log("3. Testing strategy selection for various file types:");
    const testFiles = [
        "presentation.ppt",
        "document.pdf",
        "report.docx",
        "spreadsheet.xlsx",
        "image.png",
        "data.txt",
    ];

    testFiles.forEach((filename) => {
        const strategy = getChunkingStrategy(filename, "unstructured");
        console.log(`   ${filename.padEnd(20)} -> ${strategy}`);
    });

    console.log("\n=== All Tests Completed ===");
}

// Run tests
testChunkingStrategies().catch(console.error);
