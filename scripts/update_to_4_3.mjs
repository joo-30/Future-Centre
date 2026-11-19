import fs from 'fs';

const authPath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
let auth = fs.readFileSync(authPath, 'utf8');
auth = auth.replace(/src="\/assets\/[^"]+"/g, 'src="/assets/concept_2_nutrition_vitality.jpg"');
fs.writeFileSync(authPath, auth, 'utf8');
console.log('Updated AuthPage.tsx src to concept_2_nutrition_vitality.jpg');
