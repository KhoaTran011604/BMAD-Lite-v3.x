# Infrastructure and Deployment

## Infrastructure as Code
- **Tool:** N/A (Serverless Vercel git integration)
- **Location:** None
- **Approach:** Auto-provisioned serverless environments through deployment webhooks.

## Deployment Strategy
- **Strategy:** Serverless edge deployments with previews on Pull Requests.
- **CI/CD Platform:** GitHub Actions (linting and testing) and Vercel Git Integration (build and hosting).

## Environments
- **Development:** Local host running `next dev` connected to a local MongoDB Docker container.
- **Staging:** Vercel staging deployment mapped to preview branches connected to a MongoDB Atlas Staging cluster.
- **Production:** Vercel production deployment mapped to the `main` branch connected to a MongoDB Atlas Production cluster.

## Environment Promotion Flow
```
Development → GitHub Pull Request (Staging Preview) → Merge to main (Production Deploy)
```

## Rollback Strategy
- **Primary Method:** Vercel Instant Rollback to a prior validated deployment.
- **Trigger Conditions:** Critical functional failure or database degradation on main.
- **Recovery Time Objective:** RTO < 30 seconds.
