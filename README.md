# patternpad

little regex tester i built bc i'm tired of googling regex syntax every single time.

type a pattern, type some test text, see what matches highlighted live. also has a cheatsheet tab and some common examples (email, url, phone number etc) you can just click to load.

## what it does

- tester tab, type a pattern and some test text, matches highlight live as you type
- replace tab, swap out whatever matches with new text and see the result instantly
- batch tab, paste in a bunch of lines and instantly see which ones pass or fail your pattern
- history tab, keeps track of the patterns you tried recently so you dont lose old work
- cheatsheet and examples, common regex syntax plus ready made patterns like email, url, phone number etc that you can just click to load
built with next.js, typescript, tailwind, shadcn/ui.

## running it

```bash
npm install
npm run dev
```
