# PCA WebApp - Setup Notes

## Tailwind CSS Configuration

✅ **Installed:**
- tailwindcss
- postcss
- autoprefixer

✅ **Configured:**
- `tailwind.config.js` - Scans all Vue files for Tailwind classes
- `postcss.config.js` - Processes Tailwind directives
- `src/styles/forms.css` - Custom form component classes using Tailwind utilities

## Project Structure

```
src/
├── views/
│   ├── LoginView.vue      - Authentication page (max-w-md centered)
│   └── HomeView.vue       - Main app (max-w-[1920px] for webapp layout)
├── stores/
│   └── authStore.ts       - Pinia auth state management
├── router/
│   └── index.ts           - Vue Router with auth guards
├── services/
│   └── supabase.ts        - Supabase client
├── styles/
│   └── forms.css          - Reusable form components
└── style.css              - Main styles with Tailwind imports
```

## Form Components Available

All form components use Tailwind and are defined in `src/styles/forms.css`:

- **`.form-input`** - Text inputs with focus effects
- **`.form-textarea`** - Textarea with focus effects
- **`.form-label`** - Label styling (add `.required` class for asterisk)
- **`.form-error`** - Error messages with warning icon
- **`.form-button`** - Base button styles
- **`.form-button-primary`** - Blue primary button
- **`.form-button-secondary`** - White outlined button
- **`.toggle-btn`** - Toggle button base
- **`.toggle-btn-active`** - Active toggle state
- **`.section-container`** - Card-style sections with hover
- **`.section-title`** - Section headings
- **`.add-parcel-btn`** - Special add button styling

## Screen Widths

- **Login Page:** `max-w-md` (448px) - Centered login form
- **Main App:** `max-w-[1920px]` - Full webapp width with padding
- **Responsive:** Mobile-first with sm/lg breakpoints

## Running the App

```bash
npm run dev
```

The app will start with Tailwind CSS processing enabled. All Tailwind utilities and custom form classes are available throughout the app.

## Next Steps

1. Build the split-screen layout for inspector notes + report form
2. Create the multi-step form wizard
3. Integrate DocRaptor for PDF generation
4. Connect to Supabase cloud functions
