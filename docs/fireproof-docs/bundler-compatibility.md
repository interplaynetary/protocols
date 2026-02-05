Bundler Compatibility
Bundlers can save size and improve performance by reducing the number of requests made to the server. Most development environments use a bundler to manage dependencies and assets.

Fireproof has been tested with most bundlers. However, you might need to make some configuration changes to your bundler to get Fireproof to work properly. This guide will outline some common issues you might encounter when using Fireproof with bundlers, and how to resolve them.

The Browser
For the most consistent experience, you can use our pre-bundled IIFE build available on CDN so you can include it in your HTML directly:

<script src="https://cdn.jsdelivr.net/npm/@fireproof/core/dist/browser/fireproof.iife.js"></script>


You can see the short example program that is used to validate the browser build.

Vite
Vite is a modern front-end build tool, created by Evan You (the creator of Vue.js), that offers a faster and leaner development experience for modern web projects. Vite is the easiest to work with for single-page apps, so we suggest using it to get started. There are no issues with Vite compatibility. We tested with the React / TypeScript template.

Next.js
Next.js works for client components, but the following might be helpful if you run into issues.

Issue
You might face errors when trying to use Fireproof with Next.js, particularly if your project also uses a Node.js environment. The error message could look something like this:

Error: require() of ES Module from not supported.

The conflict arises from the differences in module formats. Fireproof uses the ES Module format, while Next.js and Node.js default to using the CommonJS module format.

Solution
One option is to import the esm file directly from the Fireproof bundle. The package contiains multiple builds, so look at package.json's exports field for more details

Alternatively, to overcome this issue, we can use the next-transpile-modules package, which enables Next.js to transpile specific modules in node_modules.

Step 1: Install next-transpile-modules
Use npm to install next-transpile-modules:

npm install --save next-transpile-modules

Step 2: Configure Next.js to Transpile Fireproof Modules
Create a next.config.js file in your project root (if you don't have one already), and add the following code:

const withTM = require('next-transpile-modules')(['@fireproof/core', 'use-fireproof']);

module.exports = withTM();


This tells Next.js to transpile the Fireproof modules, which should help resolve the incompatibility issue.

Create React App
Create React App is a popular environment to create single-page React applications, handling build configurations so you can focus on writing code. There is currently a required workaround for issues in the create-react-app bundler. It's relatively easy to fix (no polyfill or additional packages required.)

Feedback
We aim to make Fireproof compatible with as many environments as possible. However, if you do encounter issues or inconsistencies when using Fireproof with Vite, Create React App, or any other environment, we highly encourage you to reach out.

Your feedback is invaluable for the continued improvement of the Fireproof library. Please report any problems through the official Fireproof GitHub repository's issue tracker or contact us directly. We appreciate your support in making Fireproof better!

Developer Sandboxes
When developing with Fireproof, you might prefer to use an online developer sandbox for faster prototyping, debugging, or collaborative coding. Luckily, Fireproof can be integrated into several popular online development environments with ease.

CodeSandbox
CodeSandbox is a versatile online code editor, supporting a wide range of frameworks and libraries, including Next.js and React. It provides a complete development environment in your browser and handles bundling and transpiling of modules effortlessly.

Fireproof works smoothly on CodeSandbox, making it a perfect choice for live development, quick prototyping, and debugging. You can import your project directly from GitHub, and it's also easy to share your sandbox with others, making collaborative work a breeze. Below the fold on the ChatGPT Expert Builders page, you can see links to three ready-to-go Fireproof code sandboxes.

CodePen
CodePen is another popular online code editor that allows you to quickly build and showcase front-end projects. It's particularly well-suited for HTML, CSS, and JavaScript projects.

To use Fireproof on CodePen, you need to enable the Babel JavaScript preprocessor. This is necessary because Babel will transpile the ES6 code into a format that can run in the browser. Here's how to enable it:

In your Pen, click on the Settings button.
Navigate to the JavaScript section.
In the JavaScript Preprocessor dropdown, select Babel.
Save & Close.
Now, your CodePen environment is all set to work with Fireproof. This allows you to create, test, and share your Fireproof code snippets with ease.

Remember, online code editors are excellent tools for prototyping, learning, and collaboration. However, for larger projects, consider setting up a local development environment for more control and flexibility.

Previous
ChatGPT Builders
