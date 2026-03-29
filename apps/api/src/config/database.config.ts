export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
});
export interface DatabaseConfig {
  url: string;
}
