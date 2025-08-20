# CircleUp

CircleUp is a full-stack web application designed to connect users through posts, comments, and interactions. It features a modern, responsive design and leverages powerful tools for seamless user experiences.

## Features

- **User Profiles**: Create and manage user profiles with personal details.
- **Posts and Comments**: Share posts and engage with others through comments.
- **Follow System**: Follow other users and build your network.
- **Notifications**: Stay updated with likes, comments, and follows.
- **Responsive Design**: Optimized for all devices using Tailwind CSS.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) for server-side rendering and React-based UI.
- **Backend**: [Prisma](https://www.prisma.io/) ORM with PostgreSQL for database management.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for modern and responsive design.
- **Authentication**: [Clerk](https://clerk.dev/) for user authentication and management.

## Project Structure

- **`prisma/schema.prisma`**: Defines the database schema, including models for users, posts, comments, and notifications.
- **`src/app`**: Contains the main application logic, including pages, components, and global styles.
- **`components/`**: Reusable UI components for the application.
- **`lib/`**: Utility functions and helpers.

## Environment Variables

The project requires the following environment variables. Add them to a `.env` file in the root directory:

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
CLERK_API_KEY=your_clerk_api_key
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/circleup.git
   cd circleup
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy CircleUp easily using [Vercel](https://vercel.com/). Follow the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying) for detailed instructions.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the framework.
- [Prisma](https://www.prisma.io/) for database management.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Clerk](https://clerk.dev/) for authentication services.
- [Vercel](https://vercel.com/) for hosting and deployment.
