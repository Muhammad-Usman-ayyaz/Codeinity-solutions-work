const fs = require('fs');

// Process CSS
let css = fs.readFileSync('e:/Codeinity-solutions-work/week_2/day_6/jobcss.css', 'utf8');

css = css.replace(
`:root {
    --bg-base: #090d1a;
    --bg-card: rgba(255, 255, 255, 0.04);
    --bg-card-hover: rgba(255, 255, 255, 0.08);
    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(139, 92, 246, 0.5);
    --accent-1: #8b5cf6;
    /* violet */
    --accent-2: #06b6d4;
    /* cyan   */
    --accent-3: #f59e0b;
    /* amber  */
    --accent-bad: #ef4444;
    --grad-primary: linear-gradient(135deg, #8b5cf6, #06b6d4);
    --grad-hero-text: linear-gradient(135deg, #a78bfa, #22d3ee, #34d399);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 22px;
    --radius-xl: 32px;
    --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.2);
    --font: 'Inter', system-ui, sans-serif;
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}`,
`:root {
    --bg-base: #f8fafc;
    --bg-card: rgba(255, 255, 255, 0.65);
    --bg-card-hover: rgba(255, 255, 255, 0.95);
    --border: rgba(0, 0, 0, 0.08);
    --border-hover: rgba(139, 92, 246, 0.4);
    --accent-1: #7c3aed;
    --accent-2: #0891b2;
    --accent-3: #d97706;
    --accent-bad: #dc2626;
    --grad-primary: linear-gradient(135deg, #7c3aed, #0891b2);
    --grad-hero-text: linear-gradient(135deg, #7c3aed, #0891b2, #059669);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 22px;
    --radius-xl: 32px;
    --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.05);
    --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.15);
    --font: 'Inter', system-ui, sans-serif;
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}`);

css = css.replace(/background: #0f172a;/g, "background: #fff;");
css = css.replace(/background: rgba\(9, 13, 26, 0\.7\);/g, "background: rgba(248, 250, 252, 0.7);");
css = css.replace(/color: #a78bfa;/g, "color: var(--accent-1);");
css = css.replace(/background: rgba\(139, 92, 246, 0\.12\);/g, "background: rgba(139, 92, 246, 0.1);");
css = css.replace(/border: 1px solid rgba\(139, 92, 246, 0\.3\);/g, "border: 1px solid rgba(139, 92, 246, 0.2);");
css = css.replace(/color: #c4b5fd;/g, "color: #6d28d9;");
css = css.replace(/background: #a78bfa;/g, "background: #7c3aed;");
css = css.replace(/background: rgba\(255, 255, 255, 0\.06\);/g, "background: #fff;");
css = css.replace(/background: rgba\(255, 255, 255, 0\.05\);/g, "background: #fff;");
css = css.replace(/border: 1.5px solid rgba\(255, 255, 255, 0\.12\);/g, "border: 1.5px solid var(--border);");
css = css.replace(/background: rgba\(139, 92, 246, 0\.18\);/g, "background: rgba(139, 92, 246, 0.15);");
css = css.replace(/background: rgba\(6, 182, 212, 0\.15\);/g, "background: rgba(6, 182, 212, 0.1);");
css = css.replace(/color: #22d3ee;/g, "color: #0891b2;");
css = css.replace(/border: 1px solid rgba\(6, 182, 212, 0\.3\);/g, "border: 1px solid rgba(6, 182, 212, 0.2);");
css = css.replace(/background: rgba\(139, 92, 246, 0\.15\);/g, "background: rgba(139, 92, 246, 0.1);");
css = css.replace(/background: rgba\(245, 158, 11, 0\.15\);/g, "background: rgba(245, 158, 11, 0.1);");
css = css.replace(/color: #fbbf24;/g, "color: #b45309;");
css = css.replace(/border: 1px solid rgba\(245, 158, 11, 0\.3\);/g, "border: 1px solid rgba(245, 158, 11, 0.2);");
css = css.replace(/background: rgba\(52, 211, 153, 0\.15\);/g, "background: rgba(52, 211, 153, 0.1);");
css = css.replace(/color: #34d399;/g, "color: #059669;");
css = css.replace(/border: 1px solid rgba\(52, 211, 153, 0\.3\);/g, "border: 1px solid rgba(52, 211, 153, 0.2);");
css = css.replace(/background: rgba\(255, 255, 255, 0\.04\);/g, "background: rgba(0, 0, 0, 0.02);");
css = css.replace(/background: rgba\(9, 13, 26, 0\.85\);/g, "background: rgba(248, 250, 252, 0.85);");
css = css.replace(/border: 3px solid rgba\(139, 92, 246, 0\.2\);/g, "border: 3px solid rgba(139, 92, 246, 0.1);");

fs.writeFileSync('e:/Codeinity-solutions-work/week_2/day_6/jobcss.css', css);

// Process JS
let js = fs.readFileSync('e:/Codeinity-solutions-work/week_2/day_6/jobjs.js', 'utf8');
js = js.replace(/#34d399/g, "var(--accent-2)");
js = js.replace(/rgba\(9,13,26,0\.95\)/g, "rgba(255,255,255,0.95)");
js = js.replace(/rgba\(9,13,26,0\.7\)/g, "rgba(248,250,252,0.7)");
fs.writeFileSync('e:/Codeinity-solutions-work/week_2/day_6/jobjs.js', js);
