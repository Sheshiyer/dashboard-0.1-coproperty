# Hospitable Developer API Documentation

## 1. Introduction

The Hospitable API provides a powerful interface for developers to interact with the Hospitable platform, enabling programatic management of vacation rental properties, reservations, messaging, and more. The ecosystem is divided into two main components tailored to different use cases:

*   **Public API**: Designed for Hospitable users who want to automate their own workflows or build custom integrations for their specific accounts.
*   **Connect API**: Built for third-party vendors and partners who wish to build integrations that serve multiple Hospitable users. It allows vendors to access data from Airbnb and other OTAs through Hospitable's unified interface.

This documentation provides a comprehensive guide to authentication, integration flows, key resources, and best practices for working with the Hospitable API.

---

## 2. Authentication

Hospitable supports two primary methods of authentication, chosen based on your integration type. All API requests must be made over HTTPS.

### 2.1. Personal Access Tokens (PATs)
**Best for:** Personal use, internal scripts, and single-account automation.

Personal Access Tokens are the simplest way to authenticate if you are building a tool for your own Hospitable account. These tokens grant the same level of access as a vendor integration but are scoped strictly to your account.

#### Generating a PAT
1.  Log in to your Hospitable account.
2.  Navigate to **Apps** > **API Access**.
3.  Click **+ Add new** in the top right corner.
4.  Give your token a descriptive name (e.g., "Internal Dashboard Script").
5.  Copy the token immediately. You will not be able to see it again.

#### Using a PAT
Include the token in the `Authorization` header of your HTTP requests using the Bearer scheme:

```bash
curl --request GET \
  --url https://public.api.hospitable.com/v2/properties \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer <YOUR_PAT_TOKEN>'
```

> **Security Note:** Never share your PATs or commit them to public repositories. Treat them like passwords.

### 2.2. OAuth 2.0 (Vendor Integration)
**Best for:** Commercial applications, multi-user integrations, and public apps.

If you are building an application for other Hospitable users, you must use the OAuth 2.0 Authorization Code flow. This ensures that users can securely grant your application access to their data without sharing their credentials.

#### Prerequisites
To use OAuth, you must first apply to become an **Approved Vendor**.
1.  Submit a request via the [Vendor Application Form](https://form.typeform.com/to/n8bZPJIm).
2.  Provide details such as your App Name, Logo URL, Redirect URL, and Webhooks URL.
3.  Once approved, you will gain access to the **Partner Portal** to manage your `client_id` and `client_secret`.

#### The OAuth Flow

**Step 1: Direct the User to the Authorization Page**
Redirect your user to Hospitable's authorization URL. You should include a unique `state` parameter to prevent CSRF attacks and identify the user upon return.

```http
https://auth.hospitable.com/oauth/authorize?client_id=<YOUR_CLIENT_ID>&response_type=code&state=<UNIQUE_STATE_STRING>
```

*   `response_type=code`: Indicates you are requesting an authorization code.
*   `client_id`: Your unique vendor ID.
*   `state`: (Recommended) A random string to maintain state between the request and callback.

**Step 2: Handle the Callback**
If the user authorizes your app, they will be redirected back to your specified `redirect_uri` with a temporary authorization code.

```http
https://your-app.com/callback?code=def5020087...&state=<YOUR_STATE_STRING>
```

**Step 3: Exchange Code for Tokens**
Exchange the authorization code for an Access Token and a Refresh Token by making a POST request to the token endpoint.

```bash
curl --request POST \
  --url https://auth.hospitable.com/oauth/token \
  --header 'Content-Type: application/json' \
  --data '{
  "client_id": "<YOUR_CLIENT_ID>",
  "client_secret": "<YOUR_CLIENT_SECRET>",
  "grant_type": "authorization_code",
  "code": "<AUTHORIZATION_CODE>"
}'
```

**Response:**
```json
{
  "token_type": "Bearer",
  "expires_in": 43200,
  "access_token": "eyJ0eXA...",
  "refresh_token": "def502005..."
}
```

*   **Access Token**: Valid for **12 hours**. Used to authenticate API requests.
*   **Refresh Token**: Valid for **90 days**. Used to obtain new access tokens.

#### Refreshing Tokens
Since access tokens are short-lived (12 hours), your application must implement a refresh logic. When you receive a `401 Unauthenticated` error, use the refresh token to get a new pair.

```bash
curl --request POST \
  --url https://auth.hospitable.com/oauth/token \
  --header 'Content-Type: application/json' \
  --data '{
  "client_id": "<YOUR_CLIENT_ID>",
  "client_secret": "<YOUR_CLIENT_SECRET>",
  "grant_type": "refresh_token",
  "refresh_token": "<YOUR_REFRESH_TOKEN>"
}'
```

> **Critical Implementation Detail:**
> *   **Database Sizing**: Tokens are large. Access tokens can be ~1,200 characters, and refresh tokens ~1,000 characters. Ensure your database columns (e.g., `TEXT` or `VARCHAR(2048)`) are large enough to prevent truncation.
> *   **Refresh Strategy**: Refresh tokens expire after 90 days. It is recommended to refresh tokens on a regular interval (e.g., daily or weekly) to ensure continuous access without requiring the user to re-authenticate.

---

## 3. Hospitable Connect API

The **Connect API** is a specialized subset of the platform designed for vendors who need to integrate with Airbnb and VRBO data via Hospitable's infrastructure. It abstracts the complexity of connecting to multiple OTAs directly.

### 3.1. Rate Limiting
Endpoints are rate-limited to **60 requests per minute** per vendor.
*   Exceeding this limit returns a `429 Too Many Requests` status.
*   Implement exponential backoff strategies to handle rate limits gracefully.

### 3.2. Data Selection and Nesting (`_select`)
The Connect API supports a powerful `_select` parameter that allows you to shape the JSON response. This is crucial for performance optimization, as you can fetch nested data in a single request rather than making multiple round-trips (N+1 problem).

**Example: Fetching a Simple List**
For a mobile view, you might only need IDs and status.
```http
GET /customers/{customer}/reservations?_select=id,status,listing.id,listing.picture
```

**Example: Fetching Deeply Nested Data**
For a detailed sync, you can request listing details and channel information within the reservation object.

```http
GET /customers/{customer}/reservations?_select=id,status,guest,listing.id,listing.address,listing.channel.name,listing.channel.first_connected_at
```

**Important constraints:**
*   Wildcards (e.g., `listing.*`) are **not supported**. You must explicitly list every field you need.
*   This explicit selection improves API stability and performance by ensuring you only transfer data you actually consume.

### 3.3. Key Resources

#### Customers
The root entity in Connect. Represents the Hospitable user whose data you are accessing.
*   **Endpoint**: `/customers`
*   **Usage**: Most other endpoints are scoped to a specific customer (e.g., `/customers/{customer_id}/reservations`).

#### Properties (Listings)
Represents the rental properties managed by the user.
*   **Data Available**: Addresses, amenities, images, occupancy settings.
*   **Capabilities**: You can retrieve listing details to map them to your own internal property representations.

#### Reservations
The core operational data.
*   **Data Available**: Guest details, check-in/out dates, financial breakdown, platform source (Airbnb, Vrbo, etc.), and status.
*   **Syncing**: Use the `updated_at` filter or webhooks to keep your local database in sync with reservation changes.

#### Messaging
Access to the unified inbox.
*   **Capabilities**: Read and send messages to guests across different platforms from a single API.
*   **Templates**: Connect API supports message templates (shortcodes) for automated personalization.

#### Calendar & Availability
*   **Calendar Restrictions**: Set blockouts, minimum stay rules, and pricing.
*   **Availability**: Query real-time availability for instant booking integrations.

---

## 4. Webhooks

Webhooks are the recommended way to stay synchronized with Hospitable data. Instead of polling endpoints, your application receives real-time `POST` requests whenever data changes.

### 4.1. Setup
You configure your primary Webhook URL in the **Partner Portal** or during the Vendor Application process.

### 4.2. Events
Common webhook events include:
*   `reservation.created`: A new booking has been confirmed.
*   `reservation.updated`: Dates, status, or guest details have changed.
*   `message.received`: A new message from a guest.
*   `listing.updated`: Property details changed.

### 4.3. Payload Structure
Webhook payloads generally contain:
*   `event`: The name of the event type.
*   `data`: The resource object that changed (e.g., the Reservation object).
*   `occurred_at`: Timestamp of the event.

Ensure your webhook handler returns a `200 OK` response quickly (within seconds) to prevent Hospitable from retrying the delivery.

---

## 5. Integration Best Practices

### 5.1. Token Management
*   **Secure Storage**: Encrypt access and refresh tokens at rest.
*   **Proactive Refresh**: Do not wait for a 401 error during critical user flows. Run a background job to refresh tokens that are close to expiring.

### 5.2. Efficient Data Syncing
*   **Initial Sync**: Use pagination to fetch all historical data.
*   **Incremental Sync**: After the initial load, use the `since` or `updated_after` query parameters to fetch only records changed since the last sync.
*   **Webhooks**: Rely on webhooks for real-time updates to minimize API usage.

### 5.3. Handling Errors
*   **401 Unauthorized**: Token expired or revoked. Trigger a refresh flow.
*   **429 Too Many Requests**: You hit the rate limit (60 req/min). Pause and retry after a delay.
*   **5xx Errors**: Server-side issue. Implement a retry mechanism with exponential backoff.

### 5.4. Connect vs. Public API
*   Use the **Public API** documentation for reference on resource fields and schemas, as the underlying data models are shared.
*   Use the **Connect API** specific endpoints for managing the connection lifecycle and multi-tenant access.

---

## 6. Support

If you encounter issues or have questions about specific payloads:
*   **Developer Hub**: [developer.hospitable.com](https://developer.hospitable.com/)
*   **Support Email**: `support@hospitable.com` (for general inquiries) or `team-platform@hospitable.com` (for API specific issues).
*   **Changelog**: Regularly check the API changelog on the developer hub to stay updated on new features and deprecations.
