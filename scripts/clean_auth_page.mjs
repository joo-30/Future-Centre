import fs from 'fs';

let code = fs.readFileSync('client/src/features/auth/AuthPage.tsx', 'utf8');

// Replace mobile showcase banner with regex
code = code.replace(
  /<div className="mobile-nutrition-showcase"[\s\S]+?<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="mobile-nutrition-showcase" aria-label="مركز المستقبل للتغذية العلاجية">
          <img
            src="/assets/concept_2_nutrition_vitality.jpg"
            alt="مركز المستقبل للتغذية العلاجية"
            className="mob-showcase-img"
          />
        </div>`
);

// Replace desktop aside with regex
code = code.replace(
  /<aside className="access-visual"[\s\S]+?<\/aside>/,
  `<aside className="access-visual" aria-label="مركز المستقبل للتغذية العلاجية">
        <img
          src="/assets/concept_2_nutrition_vitality.jpg"
          alt="مركز المستقبل للتغذية العلاجية"
          className="showcase-img"
        />
      </aside>`
);

fs.writeFileSync('client/src/features/auth/AuthPage.tsx', code, 'utf8');
console.log('Successfully replaced AuthPage.tsx components!');
