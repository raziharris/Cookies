# Supabase Setup

This project is ready for a free shared stock backend with Supabase.

## 1. Create a free Supabase project

Create a project at `https://supabase.com/`.

## 2. Run the SQL setup

In the Supabase dashboard:

1. Open `SQL Editor`
2. Paste the contents of [supabase/setup.sql](supabase/setup.sql)
3. Run it

This creates:

- shared stock table
- admin password verification
- stock reservation function for orders

The default admin password stays:

`cuzicunim`

## 3. Copy your project URL and anon key

In the Supabase dashboard:

1. Open `Project Settings`
2. Open `API`
3. Copy:
   `Project URL`
   `anon public key`

## 4. Paste them into the frontend config

Edit [assets/js/supabase-config.js](assets/js/supabase-config.js) and fill in:

```js
window.ORDERCAKE_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_ANON_KEY",
};
```

## 5. Deploy again

After those values are filled in and deployed:

- all customers will see the same stock
- stock updates will persist across devices
- settings stock changes will update the shared backend
- WhatsApp order clicks will reduce shared stock

## Notes

- If `assets/js/supabase-config.js` is left blank, the site falls back to browser `localStorage`.
- The anon key is safe to use in the browser. Do not use the service role key in the website.
