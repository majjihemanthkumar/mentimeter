// Pre-loaded quiz questions from Assessment QnA.docx
// First 20 questions covering GEN AI Workshop topics

const PRESET_QUIZZES = [
    {
        question: "What are the two main components of a GAN?",
        options: ["Encoder and Decoder", "Generator and Discriminator", "Actor and Critic", "Retriever and Reader"],
        correctAnswer: 1
    },
    {
        question: "What is the goal of the Generator in a GAN?",
        options: ["Detect fake data", "Generate realistic fake data", "Classify images", "Compress data"],
        correctAnswer: 1
    },
    {
        question: "In GAN training, the Discriminator tries to:",
        options: ["Generate noise", "Fool the Generator", "Distinguish real from fake data", "Optimize memory"],
        correctAnswer: 2
    },
    {
        question: "Diffusion models generate data by:",
        options: ["Removing noise step-by-step", "Adding noise once", "Using adversarial training", "Compressing images"],
        correctAnswer: 0
    },
    {
        question: "Stable Diffusion is mainly used for:",
        options: ["Text classification", "Image generation", "Speech recognition", "Translation"],
        correctAnswer: 1
    },
    {
        question: "Diffusion models start from:",
        options: ["Clean images", "Labeled data", "Pure noise", "Random text"],
        correctAnswer: 2
    },
    {
        question: "A VAE consists of:",
        options: ["Generator only", "Encoder and Decoder", "Retriever and Generator", "Discriminator only"],
        correctAnswer: 1
    },
    {
        question: "VAE uses which type of latent space?",
        options: ["Deterministic", "Discrete only", "Probabilistic", "Binary"],
        correctAnswer: 2
    },
    {
        question: "VAEs are mainly used for:",
        options: ["Classification", "Clustering", "Data generation", "Sorting"],
        correctAnswer: 2
    },
    {
        question: "LLMs are primarily based on:",
        options: ["CNN", "RNN", "Transformer", "SVM"],
        correctAnswer: 2
    },
    {
        question: "The attention mechanism helps the model to:",
        options: ["Reduce memory", "Focus on relevant words", "Remove noise", "Compress data"],
        correctAnswer: 1
    },
    {
        question: "GPT models are examples of:",
        options: ["Encoder-only models", "Decoder-only models", "GAN models", "VAE models"],
        correctAnswer: 1
    },
    {
        question: "Prompt engineering is:",
        options: ["Writing better training data", "Designing effective input prompts", "Building neural networks", "Optimizing GPUs"],
        correctAnswer: 1
    },
    {
        question: "Few-shot prompting means:",
        options: ["No examples", "One example", "Multiple example demonstrations", "Training the model"],
        correctAnswer: 2
    },
    {
        question: "Which type of machine learning uses labeled data to train its models?",
        options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Dimensionality Reduction"],
        correctAnswer: 1
    },
    {
        question: "K-Means is a popular example of which type of algorithm?",
        options: ["Supervised Learning", "Reinforcement Learning", "Unsupervised Learning", "Semi-supervised Learning"],
        correctAnswer: 2
    },
    {
        question: "Which algorithm is primarily used for classification rather than regression?",
        options: ["Linear Regression", "K-Means", "Principal Component Analysis (PCA)", "Logistic Regression"],
        correctAnswer: 3
    },
    {
        question: "What does 'overfitting' mean in machine learning?",
        options: ["Model performs poorly on both training and test data", "Model memorizes training data but fails to generalize", "Model performs better on test data than training data", "Model is too simple to capture patterns"],
        correctAnswer: 1
    },
    {
        question: "In KNN, what does the 'K' represent?",
        options: ["Number of nearest neighbors for prediction", "Number of distinct clusters", "Maximum iterations allowed", "Number of hidden layers"],
        correctAnswer: 0
    },
    {
        question: "What is the primary goal of an SVM in classification?",
        options: ["Finding mean squared error", "Maximizing margin of the decision boundary", "Calculating prior probability", "Building multiple decision trees"],
        correctAnswer: 1
    }
];

// Make available globally
if (typeof window !== 'undefined') {
    window.PRESET_QUIZZES = PRESET_QUIZZES;
}
