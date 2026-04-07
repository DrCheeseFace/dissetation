0.  Abstract 
    summary of the entire project: the problem with missing data,
    the visual/tracking tool you built, the tech stack used, and the final evaluation of your system.

1.  Introduction
    1. Motivation
       - The critical impact of missing data in datasets (e.g., medical or census data)
         and the challenge data scientists face in tracking different imputation methods and visualizing their effects.
    2. Aims and Hypothesis
       - The overarching goal to build a robust, interactive web application that not
         only performs imputations but allows users to visually compare and version-control the outcomes.
    3. Objectives
       - Develop a full-stack application for data ingestion and processing.
       - Implement "Git-style" version tracking for parent and child datasets.
       - Integrate multiple missing data algorithms (Constant, KNN, MICE).
       - Construct interactive visual diagnostics (MissiG, Parallel Coordinates, Matrix Plots) to evaluate imputation quality using specific metrics (WD, MAD).
    4. Dissertation Structure
       - A brief roadmap of the chapters to follow.

2.  Background Review
    1. The Nature of Missing Data Mechanisms
       - Missing Completely at Random (MCAR), Missing at Random (MAR), Missing Not at Random (MNAR).
         Specific Missingness Types: Joint Missingness (JM) and Conditional Missingness (CM).
    2. Imputation Techniques
       - Review of methods utilized: Constant, K-Nearest Neighbours (KNN)
         and Multiple Imputation by Chained Equations (MICE).
       - Evaluate their strengths and weaknesses.
    3. Visualizing Missing Data
       - The role of Missingness Maps, and MissiG glyphs.
       - Techniques for evaluating post-imputation (Parallel Coordinates).
    4. Technology Stack Evaluation
       - The necessity of Python/Pandas/NumPy for backend data processing. ???
    5. Previous implementations
       - VIM, IMPUTE-VSS, PROFILER, AMELIA

3.  Methodology and System Architecture
    1. High-Level Architecture
       - The containerized environment.
       - Client-Server communication (Custom JSON formatting, REST endpoints like missiG).
       - State management utilizing MobX stores to handle complex dataset tracking.
    2. Data Versioning System
       - Tracking imputation child files against parent files.
       - State reversion UI and promoting child files to parent status.

4.  Implementation Details
    1. Synthetic Data Generation
       - Engineering controlled missingness into complete datasets to test the system.
    2. Pre-Imputation Analytics (MissiG)
       - Backend generation of histograms and missing data info using Pandas/NumPy.
       - Implementing the MissiG D3 React component
       - Performance optimizations (MissiG caching implementation).
    3. Post-Imputation & Diagnostics
       - Executing KNN and MICE.
       - Calculating and returning comparison info: Wasserstein Distance (WD) and Mean Absolute Deviation (MAD).
       - Interactive Parallel Coordinates with highlighting for comparison.
       - Matrix plot implementation.

5.  Results and Evaluation
    1. System Outputs
       - Walkthrough of the completed UI and the user journey.
    2. Technical Evaluation
       - Performance of the backend Python calculations and D3 rendering.
    3. Limitations
       - Features scoped out due to time (showing direct UI diffs between multiple different imputations simultaneously, file download implementation).

6.  Conclusions
    1. Summary of Achievements
       - How effectively the project met the initial SMART objectives.
    2. Future Work
       - Implementing the multi-imputation diff views.
       - Adding dataset download functionality. NOT SURE HERE.
       - Expanding to deeper machine-learning-based imputation models.
       - more visualistations

7.  References
    - for all Kaggle datasets, D3/React documentation, and academic papers on MICE/KNN and missing data mechanisms.

8.  Appendices
    Appendix A: Project Poster (Drafts and Final).
    Appendix B: User Manual / Application Screenshots.
    Appendix C: Key Source Code Snippets (e.g., the custom JSON format generator, or the MissiG D3 component logic).
    Appendix D: Full Git Commit Log (to evidence the timeline and consistent development).
