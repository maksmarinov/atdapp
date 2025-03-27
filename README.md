# ATDApp

## ⚠️ Just Another To Do App... but with a twist ~~~> You can play 🐂Bulls and Cows🐄 if you dont have any task to do⚠️

**IMPORTANT:** Migrated to NeonDB with Prisma ORM , since Supabase was not playing nice with Vercel deployment and Prisma.

## Project Overview

You can log your tasks with due date and track if they have been completed. If not marked as completed manually, the task will be marked as "Procrastinated" automatically. For each 10 procrastinted tasks you will lose one score against the computer in the game Bulls and Cows.

##BULLS & COWS RULES:

- You and the computer come up with a random 4 digit number. Number cant have repeating digits and 0 (zero) cannot be the first digit of the number (e.g. Correct nums 🟩: 1234, 9172, 2034,1480.... / Incorrect nums 🟥: 1123, 7817, 0918, 4440.... ). After both players come up with a number game starts, game is turn based, players will switch each game who's going to initiate the game. Player gives a guess with a four digit number (which also follows the rules) what is his opponents number, after which the opponent will reply with the result, eg User: "4290?" -> Bot: "1 Bull and 1 Cow!" (Bot's number is for example 4821 - where 4 is the Bull since its in the correct place and 2 is the Cow since it is present in Bot's number but in a different position.) Now it is Bot's turn, he will ask: "3198?", lets say Players number is 9806, the Player will reply: "2 Cows" by chosing from the drop down menus for bulls and cows in the Response tab. Game is won when one player guesses the number of his opponent. The game will have a 3rd party middleman to doublecheck the replies of each player against their own number, to see if the replies are truthful...so dont cheat.

## Features

- Email/Password authentication
- Google OAuth integration
- User profile management
- Dashboard interface
- Responsive design
- 🧮🧮🧮 🐂 B&C 🐄 🧮🧮🧮 GAME!

## Tech Stack

- **Frontend**: Next.js 15.2.3 with App Router
- **Authentication**: Email and Google Atuh
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Styling**: Tailwind CSS

This project was bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and uses the [Next.js App Router](https://nextjs.org/docs/app).
