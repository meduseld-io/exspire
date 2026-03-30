# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.1.0-alpha (2026-03-30)


### New Features

* add favicon ([555b260](https://github.com/meduseld-io/exspire/commit/555b260d594756f336310bbf0d09ab6e66a7ced2))
* Add swipe gestures, pull-to-refresh, dark/light theme, change password, delete account ([47b585c](https://github.com/meduseld-io/exspire/commit/47b585c744a397c1b414c8ec12ed57c0f0d63d11))
* **admin:** Add admin panel with user and item management ([d1b911d](https://github.com/meduseld-io/exspire/commit/d1b911d026d2998be60be2c12e20d447eae5c557))
* **admin:** Add admin panel with user list and item viewer ([3c0ca37](https://github.com/meduseld-io/exspire/commit/3c0ca37c971c24d14479b9ad6eabb58a83f7ca08))
* **app:** Initial ExSpire implementation ([ba2fcac](https://github.com/meduseld-io/exspire/commit/ba2fcacc7eb00149fb979df058663aa465167835))
* Auto-populate notification email from login email ([8f3fad0](https://github.com/meduseld-io/exspire/commit/8f3fad034d70b9c8d50c07ae76cfa2ae6b23a7a4))
* **items:** Add recurring items system ([35ff0f7](https://github.com/meduseld-io/exspire/commit/35ff0f7efd1081bc8f4c659fc58407584c9d8843))
* **notifications:** Add browser push notifications and PWA support ([e35de53](https://github.com/meduseld-io/exspire/commit/e35de53fb507e0eb96303fa3eb48ea0e52019ca8))
* **notifications:** Update sender to exspire@meduseld.io and add ExSpire link to email template ([7f641a8](https://github.com/meduseld-io/exspire/commit/7f641a8da3baa5582ce451c461599374e49e0ac1))
* Paginate tower list with show-more button after 21 items ([6eb6f33](https://github.com/meduseld-io/exspire/commit/6eb6f3302ff1037b933fe01dd7517ea5ac3ce304))
* Replace profile button with dropdown menu ([91f9a31](https://github.com/meduseld-io/exspire/commit/91f9a31df10fd7537992c5109b906717fb2a5202))
* **security:** Add input sanitization and validation ([0996c5c](https://github.com/meduseld-io/exspire/commit/0996c5cfd650732631a902150e85c8f609055108))
* **security:** Add rate limiting on auth endpoints ([5208ce1](https://github.com/meduseld-io/exspire/commit/5208ce10b10d0fee394e8841e652c7c955d10e7b))
* **ui:** Add category filter bar above the tower ([d72fb9a](https://github.com/meduseld-io/exspire/commit/d72fb9a8ebe629f958875345b5d653d7917b3480))
* **ui:** Add delete confirmation dialog, toast notifications, and category count badges ([e0e00cf](https://github.com/meduseld-io/exspire/commit/e0e00cf60d3654ed22e6b23ef5d8a2980da572b7))
* **ui:** Add inline search button to filter items by name ([69a4dde](https://github.com/meduseld-io/exspire/commit/69a4dde8d2198845f7f34908439173569964abb4))
* **ui:** Add mobile install banner prompting homescreen add ([0573191](https://github.com/meduseld-io/exspire/commit/0573191cf6d2db4004659b2b390689c462203f2f))
* **ui:** Add profile button with settings modal and notification type dropdown ([9db08fb](https://github.com/meduseld-io/exspire/commit/9db08fbee85039e5f92932f9c47453dfb0afac4e))
* **ui:** Add tap-to-expand on mobile cards to reveal edit/delete buttons ([9393329](https://github.com/meduseld-io/exspire/commit/93933290c6cbc5b708b1964802baf45189be1019))
* **ui:** Add test notification button for email template testing ([1b5e28e](https://github.com/meduseld-io/exspire/commit/1b5e28e77dde5199ddad43abe0b011ea325ba58d))
* **ui:** Add tower alignment setting (left, center, right) ([fccf56b](https://github.com/meduseld-io/exspire/commit/fccf56b31a0f4e00ab78125650d517a288ea2c30))
* **ui:** Inline editing replaces tower card in-place ([b772b84](https://github.com/meduseld-io/exspire/commit/b772b848e343121cae7b4e937c9745e0785163e5))
* **ui:** Replace 'other' category with custom category text input ([4015dad](https://github.com/meduseld-io/exspire/commit/4015dad63c7757c6872b8c3ac162915bf5c13c69))
* **ui:** Replace test button with dropdown for email and push testing ([898bfc8](https://github.com/meduseld-io/exspire/commit/898bfc8a3246034c6f282269bc7c2d83b9d32f9e))
* **ui:** Show years and months for expiry dates over 6 months ([65a5212](https://github.com/meduseld-io/exspire/commit/65a5212ce591d83731003476a75935ba7c1d3860))


### Bug Fixes

* Add loading state and feedback to verification email button ([f83e2b2](https://github.com/meduseld-io/exspire/commit/f83e2b20af5d79a6d3826e21e3161eba67bd395f))
* **api:** Add global rate limiter to all API routes ([2ef87c6](https://github.com/meduseld-io/exspire/commit/2ef87c68943483d7873b9aa56403814fa84725f4))
* **api:** Add rate limiter to SPA fallback route ([82fd9fa](https://github.com/meduseld-io/exspire/commit/82fd9fabf2bc86e56e486bd37a19ca61d5158ef9))
* **api:** Apply rate limiter directly to each route handler ([26f3bfc](https://github.com/meduseld-io/exspire/commit/26f3bfcd579427af210253dcf356eee6e63274ba))
* **backend:** Bump nodemailer to 8.x to fix addressparser DoS and SMTP injection ([11b36e0](https://github.com/meduseld-io/exspire/commit/11b36e088b5d346f46e01836195d5e5b58a1496c))
* **config:** Load env from /etc/exspire.env for root-only secrets ([176371d](https://github.com/meduseld-io/exspire/commit/176371d900edbba52c78e3761ffbcb40f2900c4a))
* **items:** Add expiry date validation on create and edit ([7fd6804](https://github.com/meduseld-io/exspire/commit/7fd6804d0c7680362c13147e2a80b8427fa6e3cc))
* Move modals and toasts outside app-container ([1e5d4d4](https://github.com/meduseld-io/exspire/commit/1e5d4d4dafebd0690992104a5f3b46ada08b7acd))
* **ui:** Admin-only test button, floating add FAB, mobile expired item display ([58d399a](https://github.com/meduseld-io/exspire/commit/58d399ae8079472250423a671005ffa110f4076a))
* **ui:** Fix janky vertical scrolling during swipe-to-delete on mobile ([3d9953c](https://github.com/meduseld-io/exspire/commit/3d9953c90dcc0710dfc1e73d9e23bf8426a00b73))
* **ui:** Fix mobile swipe-to-reveal snapping back on touch end ([da7c736](https://github.com/meduseld-io/exspire/commit/da7c73678d7e11f0cbb2c31dbc38711ca608be9e))
* **ui:** Increase pull-to-refresh threshold to prevent accidental triggers ([0e5c3dd](https://github.com/meduseld-io/exspire/commit/0e5c3dded4449ac69edb3da9a5e2e7903197cd5a))
* **ui:** Make tower animation stagger adaptive to item count ([473ee73](https://github.com/meduseld-io/exspire/commit/473ee7381dda2c9596e9059a13b975dafbef5ea6))
* **ui:** Move pull-to-refresh indicator above app container ([0837c19](https://github.com/meduseld-io/exspire/commit/0837c19334122e8085d7e506b078488fe5c55a6c))
* **ui:** Play exit animation after delete confirmation, not on button press ([27d437d](https://github.com/meduseld-io/exspire/commit/27d437d9f209f20a0e95530a74072058ee081340))
* **ui:** Prevent iOS Safari auto-zoom on input focus ([ea96f34](https://github.com/meduseld-io/exspire/commit/ea96f34ac67934c5edb34493cb2129f53613608f))
* **ui:** Prevent swipe actions showing through expired items ([51517fc](https://github.com/meduseld-io/exspire/commit/51517fc93d6b256796ba038d26688cb5a769e6da))
* **ui:** Reduce vertical bounce on swipe-to-delete gesture ([08b6e01](https://github.com/meduseld-io/exspire/commit/08b6e011d0146ecf1daa4f2b8c52e255303bb35c))
* **ui:** Remove vertical bounce on swipe-to-delete ([ebd7e17](https://github.com/meduseld-io/exspire/commit/ebd7e17203e71b05c064e23ce862b690fb5ea841))
* **ui:** Show generic placeholder on sign-in password field ([5d9780a](https://github.com/meduseld-io/exspire/commit/5d9780a05a2ba844e3e1c26e2a0f0f501ad0981e))
* **ui:** Switch service worker to network-first for fresh deploys ([7802cb2](https://github.com/meduseld-io/exspire/commit/7802cb23f639a9167abee6eb39d84e1d561d6a87))
* **ui:** Update apple touch icon ([82155ff](https://github.com/meduseld-io/exspire/commit/82155ff807dddd05270a54a57cf79adf909bb57e))
* **ui:** Use touch-action none with manual scroll to eliminate vertical bounce ([5d87ac2](https://github.com/meduseld-io/exspire/commit/5d87ac2cd73d03c9128bdaf741f2b43333549a36))
* Update path-to-regexp to 0.1.13 to fix ReDoS vulnerability ([88731dc](https://github.com/meduseld-io/exspire/commit/88731dcfc78d96a186098b9ceb8c3660e85f880e))


### Performance

* **ui:** Smooth delete animation instead of full tower rebuild ([3c31e5e](https://github.com/meduseld-io/exspire/commit/3c31e5ee75762a7c949c299e73ba35cadbaebffe))


### Refactoring

* **ui:** Rename tower to spire across codebase ([a2f006e](https://github.com/meduseld-io/exspire/commit/a2f006e0e26e9be70b133acc5e9ded1aee954f65))


### Styling

* **docs:** Replace em dashes with single hyphens in README ([ff5008d](https://github.com/meduseld-io/exspire/commit/ff5008d26b945d83e7a2ab5dccd065e5f7319815))
* **ui:** Add staggered build-from-ground animation on tower filter changes ([d936c01](https://github.com/meduseld-io/exspire/commit/d936c01b8b18dab99bfc6a7587a564ef9cf473d3))
* **ui:** Capitalize category names instead of uppercase ([77caf59](https://github.com/meduseld-io/exspire/commit/77caf59c353adda8ce710b611923bd56d6f9b6f9))
* **ui:** Collapse filter chips into dropdown on mobile ([01fb716](https://github.com/meduseld-io/exspire/commit/01fb716b91af2b05aa01c61889fcc6c0581e5492))
* **ui:** Disable text selection cursor on app title ([893b7b8](https://github.com/meduseld-io/exspire/commit/893b7b8a5a2015ad66a533bb05760daba3f071fa))
* **ui:** Make pull-to-refresh spinner more visible ([77e4cff](https://github.com/meduseld-io/exspire/commit/77e4cffaa0387af92657b8db2b433b592cf20619))
* **ui:** Pin footer to bottom of page ([bccfa30](https://github.com/meduseld-io/exspire/commit/bccfa306f27550ab7163d677a29532d91d1a97cd))
* **ui:** Reduce mobile filter dropdown width to 50% ([bb7fbec](https://github.com/meduseld-io/exspire/commit/bb7fbece4c9c32d89d4e52dd76c96ee810613b99))
* **ui:** Revert chips and badges to uppercase, keep dropdown capitalize ([3520b9f](https://github.com/meduseld-io/exspire/commit/3520b9f8fd83f4052bbb00cd2223b4c428c0093c))
* **ui:** Update logo and add ExSpire title text to header ([f42f5ea](https://github.com/meduseld-io/exspire/commit/f42f5eaac802d4fa4197794af48ae2364dca8761))

## 0.1.0-alpha (2026-03-30)


### New Features

* add favicon ([555b260](https://github.com/meduseld-io/exspire/commit/555b260d594756f336310bbf0d09ab6e66a7ced2))
* Add swipe gestures, pull-to-refresh, dark/light theme, change password, delete account ([47b585c](https://github.com/meduseld-io/exspire/commit/47b585c744a397c1b414c8ec12ed57c0f0d63d11))
* **admin:** Add admin panel with user and item management ([d1b911d](https://github.com/meduseld-io/exspire/commit/d1b911d026d2998be60be2c12e20d447eae5c557))
* **admin:** Add admin panel with user list and item viewer ([3c0ca37](https://github.com/meduseld-io/exspire/commit/3c0ca37c971c24d14479b9ad6eabb58a83f7ca08))
* **app:** Initial ExSpire implementation ([ba2fcac](https://github.com/meduseld-io/exspire/commit/ba2fcacc7eb00149fb979df058663aa465167835))
* Auto-populate notification email from login email ([8f3fad0](https://github.com/meduseld-io/exspire/commit/8f3fad034d70b9c8d50c07ae76cfa2ae6b23a7a4))
* **items:** Add recurring items system ([35ff0f7](https://github.com/meduseld-io/exspire/commit/35ff0f7efd1081bc8f4c659fc58407584c9d8843))
* **notifications:** Add browser push notifications and PWA support ([e35de53](https://github.com/meduseld-io/exspire/commit/e35de53fb507e0eb96303fa3eb48ea0e52019ca8))
* **notifications:** Update sender to exspire@meduseld.io and add ExSpire link to email template ([7f641a8](https://github.com/meduseld-io/exspire/commit/7f641a8da3baa5582ce451c461599374e49e0ac1))
* Paginate tower list with show-more button after 21 items ([6eb6f33](https://github.com/meduseld-io/exspire/commit/6eb6f3302ff1037b933fe01dd7517ea5ac3ce304))
* Replace profile button with dropdown menu ([91f9a31](https://github.com/meduseld-io/exspire/commit/91f9a31df10fd7537992c5109b906717fb2a5202))
* **security:** Add input sanitization and validation ([0996c5c](https://github.com/meduseld-io/exspire/commit/0996c5cfd650732631a902150e85c8f609055108))
* **security:** Add rate limiting on auth endpoints ([5208ce1](https://github.com/meduseld-io/exspire/commit/5208ce10b10d0fee394e8841e652c7c955d10e7b))
* **ui:** Add category filter bar above the tower ([d72fb9a](https://github.com/meduseld-io/exspire/commit/d72fb9a8ebe629f958875345b5d653d7917b3480))
* **ui:** Add delete confirmation dialog, toast notifications, and category count badges ([e0e00cf](https://github.com/meduseld-io/exspire/commit/e0e00cf60d3654ed22e6b23ef5d8a2980da572b7))
* **ui:** Add inline search button to filter items by name ([69a4dde](https://github.com/meduseld-io/exspire/commit/69a4dde8d2198845f7f34908439173569964abb4))
* **ui:** Add mobile install banner prompting homescreen add ([0573191](https://github.com/meduseld-io/exspire/commit/0573191cf6d2db4004659b2b390689c462203f2f))
* **ui:** Add profile button with settings modal and notification type dropdown ([9db08fb](https://github.com/meduseld-io/exspire/commit/9db08fbee85039e5f92932f9c47453dfb0afac4e))
* **ui:** Add tap-to-expand on mobile cards to reveal edit/delete buttons ([9393329](https://github.com/meduseld-io/exspire/commit/93933290c6cbc5b708b1964802baf45189be1019))
* **ui:** Add test notification button for email template testing ([1b5e28e](https://github.com/meduseld-io/exspire/commit/1b5e28e77dde5199ddad43abe0b011ea325ba58d))
* **ui:** Add tower alignment setting (left, center, right) ([fccf56b](https://github.com/meduseld-io/exspire/commit/fccf56b31a0f4e00ab78125650d517a288ea2c30))
* **ui:** Inline editing replaces tower card in-place ([b772b84](https://github.com/meduseld-io/exspire/commit/b772b848e343121cae7b4e937c9745e0785163e5))
* **ui:** Replace 'other' category with custom category text input ([4015dad](https://github.com/meduseld-io/exspire/commit/4015dad63c7757c6872b8c3ac162915bf5c13c69))
* **ui:** Replace test button with dropdown for email and push testing ([898bfc8](https://github.com/meduseld-io/exspire/commit/898bfc8a3246034c6f282269bc7c2d83b9d32f9e))
* **ui:** Show years and months for expiry dates over 6 months ([65a5212](https://github.com/meduseld-io/exspire/commit/65a5212ce591d83731003476a75935ba7c1d3860))


### Bug Fixes

* Add loading state and feedback to verification email button ([f83e2b2](https://github.com/meduseld-io/exspire/commit/f83e2b20af5d79a6d3826e21e3161eba67bd395f))
* **api:** Add global rate limiter to all API routes ([2ef87c6](https://github.com/meduseld-io/exspire/commit/2ef87c68943483d7873b9aa56403814fa84725f4))
* **api:** Add rate limiter to SPA fallback route ([82fd9fa](https://github.com/meduseld-io/exspire/commit/82fd9fabf2bc86e56e486bd37a19ca61d5158ef9))
* **api:** Apply rate limiter directly to each route handler ([26f3bfc](https://github.com/meduseld-io/exspire/commit/26f3bfcd579427af210253dcf356eee6e63274ba))
* **backend:** Bump nodemailer to 8.x to fix addressparser DoS and SMTP injection ([11b36e0](https://github.com/meduseld-io/exspire/commit/11b36e088b5d346f46e01836195d5e5b58a1496c))
* **config:** Load env from /etc/exspire.env for root-only secrets ([176371d](https://github.com/meduseld-io/exspire/commit/176371d900edbba52c78e3761ffbcb40f2900c4a))
* **items:** Add expiry date validation on create and edit ([7fd6804](https://github.com/meduseld-io/exspire/commit/7fd6804d0c7680362c13147e2a80b8427fa6e3cc))
* Move modals and toasts outside app-container ([1e5d4d4](https://github.com/meduseld-io/exspire/commit/1e5d4d4dafebd0690992104a5f3b46ada08b7acd))
* **ui:** Admin-only test button, floating add FAB, mobile expired item display ([58d399a](https://github.com/meduseld-io/exspire/commit/58d399ae8079472250423a671005ffa110f4076a))
* **ui:** Fix janky vertical scrolling during swipe-to-delete on mobile ([3d9953c](https://github.com/meduseld-io/exspire/commit/3d9953c90dcc0710dfc1e73d9e23bf8426a00b73))
* **ui:** Fix mobile swipe-to-reveal snapping back on touch end ([da7c736](https://github.com/meduseld-io/exspire/commit/da7c73678d7e11f0cbb2c31dbc38711ca608be9e))
* **ui:** Increase pull-to-refresh threshold to prevent accidental triggers ([0e5c3dd](https://github.com/meduseld-io/exspire/commit/0e5c3dded4449ac69edb3da9a5e2e7903197cd5a))
* **ui:** Make tower animation stagger adaptive to item count ([473ee73](https://github.com/meduseld-io/exspire/commit/473ee7381dda2c9596e9059a13b975dafbef5ea6))
* **ui:** Move pull-to-refresh indicator above app container ([0837c19](https://github.com/meduseld-io/exspire/commit/0837c19334122e8085d7e506b078488fe5c55a6c))
* **ui:** Play exit animation after delete confirmation, not on button press ([27d437d](https://github.com/meduseld-io/exspire/commit/27d437d9f209f20a0e95530a74072058ee081340))
* **ui:** Prevent iOS Safari auto-zoom on input focus ([ea96f34](https://github.com/meduseld-io/exspire/commit/ea96f34ac67934c5edb34493cb2129f53613608f))
* **ui:** Prevent swipe actions showing through expired items ([51517fc](https://github.com/meduseld-io/exspire/commit/51517fc93d6b256796ba038d26688cb5a769e6da))
* **ui:** Reduce vertical bounce on swipe-to-delete gesture ([08b6e01](https://github.com/meduseld-io/exspire/commit/08b6e011d0146ecf1daa4f2b8c52e255303bb35c))
* **ui:** Remove vertical bounce on swipe-to-delete ([ebd7e17](https://github.com/meduseld-io/exspire/commit/ebd7e17203e71b05c064e23ce862b690fb5ea841))
* **ui:** Show generic placeholder on sign-in password field ([5d9780a](https://github.com/meduseld-io/exspire/commit/5d9780a05a2ba844e3e1c26e2a0f0f501ad0981e))
* **ui:** Switch service worker to network-first for fresh deploys ([7802cb2](https://github.com/meduseld-io/exspire/commit/7802cb23f639a9167abee6eb39d84e1d561d6a87))
* **ui:** Update apple touch icon ([82155ff](https://github.com/meduseld-io/exspire/commit/82155ff807dddd05270a54a57cf79adf909bb57e))
* **ui:** Use touch-action none with manual scroll to eliminate vertical bounce ([5d87ac2](https://github.com/meduseld-io/exspire/commit/5d87ac2cd73d03c9128bdaf741f2b43333549a36))
* Update path-to-regexp to 0.1.13 to fix ReDoS vulnerability ([88731dc](https://github.com/meduseld-io/exspire/commit/88731dcfc78d96a186098b9ceb8c3660e85f880e))


### Performance

* **ui:** Smooth delete animation instead of full tower rebuild ([3c31e5e](https://github.com/meduseld-io/exspire/commit/3c31e5ee75762a7c949c299e73ba35cadbaebffe))


### Refactoring

* **ui:** Rename tower to spire across codebase ([a2f006e](https://github.com/meduseld-io/exspire/commit/a2f006e0e26e9be70b133acc5e9ded1aee954f65))


### Styling

* **docs:** Replace em dashes with single hyphens in README ([ff5008d](https://github.com/meduseld-io/exspire/commit/ff5008d26b945d83e7a2ab5dccd065e5f7319815))
* **ui:** Add staggered build-from-ground animation on tower filter changes ([d936c01](https://github.com/meduseld-io/exspire/commit/d936c01b8b18dab99bfc6a7587a564ef9cf473d3))
* **ui:** Capitalize category names instead of uppercase ([77caf59](https://github.com/meduseld-io/exspire/commit/77caf59c353adda8ce710b611923bd56d6f9b6f9))
* **ui:** Collapse filter chips into dropdown on mobile ([01fb716](https://github.com/meduseld-io/exspire/commit/01fb716b91af2b05aa01c61889fcc6c0581e5492))
* **ui:** Disable text selection cursor on app title ([893b7b8](https://github.com/meduseld-io/exspire/commit/893b7b8a5a2015ad66a533bb05760daba3f071fa))
* **ui:** Make pull-to-refresh spinner more visible ([77e4cff](https://github.com/meduseld-io/exspire/commit/77e4cffaa0387af92657b8db2b433b592cf20619))
* **ui:** Pin footer to bottom of page ([bccfa30](https://github.com/meduseld-io/exspire/commit/bccfa306f27550ab7163d677a29532d91d1a97cd))
* **ui:** Reduce mobile filter dropdown width to 50% ([bb7fbec](https://github.com/meduseld-io/exspire/commit/bb7fbece4c9c32d89d4e52dd76c96ee810613b99))
* **ui:** Revert chips and badges to uppercase, keep dropdown capitalize ([3520b9f](https://github.com/meduseld-io/exspire/commit/3520b9f8fd83f4052bbb00cd2223b4c428c0093c))
* **ui:** Update logo and add ExSpire title text to header ([f42f5ea](https://github.com/meduseld-io/exspire/commit/f42f5eaac802d4fa4197794af48ae2364dca8761))

## 0.1.0-alpha (2026-03-30)


### New Features

* add favicon ([555b260](https://github.com/meduseld-io/exspire/commit/555b260d594756f336310bbf0d09ab6e66a7ced2))
* Add swipe gestures, pull-to-refresh, dark/light theme, change password, delete account ([47b585c](https://github.com/meduseld-io/exspire/commit/47b585c744a397c1b414c8ec12ed57c0f0d63d11))
* **admin:** Add admin panel with user and item management ([d1b911d](https://github.com/meduseld-io/exspire/commit/d1b911d026d2998be60be2c12e20d447eae5c557))
* **admin:** Add admin panel with user list and item viewer ([3c0ca37](https://github.com/meduseld-io/exspire/commit/3c0ca37c971c24d14479b9ad6eabb58a83f7ca08))
* **app:** Initial ExSpire implementation ([ba2fcac](https://github.com/meduseld-io/exspire/commit/ba2fcacc7eb00149fb979df058663aa465167835))
* Auto-populate notification email from login email ([8f3fad0](https://github.com/meduseld-io/exspire/commit/8f3fad034d70b9c8d50c07ae76cfa2ae6b23a7a4))
* **items:** Add recurring items system ([35ff0f7](https://github.com/meduseld-io/exspire/commit/35ff0f7efd1081bc8f4c659fc58407584c9d8843))
* **notifications:** Add browser push notifications and PWA support ([e35de53](https://github.com/meduseld-io/exspire/commit/e35de53fb507e0eb96303fa3eb48ea0e52019ca8))
* **notifications:** Update sender to exspire@meduseld.io and add ExSpire link to email template ([7f641a8](https://github.com/meduseld-io/exspire/commit/7f641a8da3baa5582ce451c461599374e49e0ac1))
* Paginate tower list with show-more button after 21 items ([6eb6f33](https://github.com/meduseld-io/exspire/commit/6eb6f3302ff1037b933fe01dd7517ea5ac3ce304))
* Replace profile button with dropdown menu ([91f9a31](https://github.com/meduseld-io/exspire/commit/91f9a31df10fd7537992c5109b906717fb2a5202))
* **security:** Add input sanitization and validation ([0996c5c](https://github.com/meduseld-io/exspire/commit/0996c5cfd650732631a902150e85c8f609055108))
* **security:** Add rate limiting on auth endpoints ([5208ce1](https://github.com/meduseld-io/exspire/commit/5208ce10b10d0fee394e8841e652c7c955d10e7b))
* **ui:** Add category filter bar above the tower ([d72fb9a](https://github.com/meduseld-io/exspire/commit/d72fb9a8ebe629f958875345b5d653d7917b3480))
* **ui:** Add delete confirmation dialog, toast notifications, and category count badges ([e0e00cf](https://github.com/meduseld-io/exspire/commit/e0e00cf60d3654ed22e6b23ef5d8a2980da572b7))
* **ui:** Add inline search button to filter items by name ([69a4dde](https://github.com/meduseld-io/exspire/commit/69a4dde8d2198845f7f34908439173569964abb4))
* **ui:** Add mobile install banner prompting homescreen add ([0573191](https://github.com/meduseld-io/exspire/commit/0573191cf6d2db4004659b2b390689c462203f2f))
* **ui:** Add profile button with settings modal and notification type dropdown ([9db08fb](https://github.com/meduseld-io/exspire/commit/9db08fbee85039e5f92932f9c47453dfb0afac4e))
* **ui:** Add tap-to-expand on mobile cards to reveal edit/delete buttons ([9393329](https://github.com/meduseld-io/exspire/commit/93933290c6cbc5b708b1964802baf45189be1019))
* **ui:** Add test notification button for email template testing ([1b5e28e](https://github.com/meduseld-io/exspire/commit/1b5e28e77dde5199ddad43abe0b011ea325ba58d))
* **ui:** Add tower alignment setting (left, center, right) ([fccf56b](https://github.com/meduseld-io/exspire/commit/fccf56b31a0f4e00ab78125650d517a288ea2c30))
* **ui:** Inline editing replaces tower card in-place ([b772b84](https://github.com/meduseld-io/exspire/commit/b772b848e343121cae7b4e937c9745e0785163e5))
* **ui:** Replace 'other' category with custom category text input ([4015dad](https://github.com/meduseld-io/exspire/commit/4015dad63c7757c6872b8c3ac162915bf5c13c69))
* **ui:** Replace test button with dropdown for email and push testing ([898bfc8](https://github.com/meduseld-io/exspire/commit/898bfc8a3246034c6f282269bc7c2d83b9d32f9e))
* **ui:** Show years and months for expiry dates over 6 months ([65a5212](https://github.com/meduseld-io/exspire/commit/65a5212ce591d83731003476a75935ba7c1d3860))


### Bug Fixes

* Add loading state and feedback to verification email button ([f83e2b2](https://github.com/meduseld-io/exspire/commit/f83e2b20af5d79a6d3826e21e3161eba67bd395f))
* **api:** Add global rate limiter to all API routes ([2ef87c6](https://github.com/meduseld-io/exspire/commit/2ef87c68943483d7873b9aa56403814fa84725f4))
* **api:** Add rate limiter to SPA fallback route ([82fd9fa](https://github.com/meduseld-io/exspire/commit/82fd9fabf2bc86e56e486bd37a19ca61d5158ef9))
* **api:** Apply rate limiter directly to each route handler ([26f3bfc](https://github.com/meduseld-io/exspire/commit/26f3bfcd579427af210253dcf356eee6e63274ba))
* **backend:** Bump nodemailer to 8.x to fix addressparser DoS and SMTP injection ([11b36e0](https://github.com/meduseld-io/exspire/commit/11b36e088b5d346f46e01836195d5e5b58a1496c))
* **config:** Load env from /etc/exspire.env for root-only secrets ([176371d](https://github.com/meduseld-io/exspire/commit/176371d900edbba52c78e3761ffbcb40f2900c4a))
* **items:** Add expiry date validation on create and edit ([7fd6804](https://github.com/meduseld-io/exspire/commit/7fd6804d0c7680362c13147e2a80b8427fa6e3cc))
* Move modals and toasts outside app-container ([1e5d4d4](https://github.com/meduseld-io/exspire/commit/1e5d4d4dafebd0690992104a5f3b46ada08b7acd))
* **ui:** Admin-only test button, floating add FAB, mobile expired item display ([58d399a](https://github.com/meduseld-io/exspire/commit/58d399ae8079472250423a671005ffa110f4076a))
* **ui:** Fix janky vertical scrolling during swipe-to-delete on mobile ([3d9953c](https://github.com/meduseld-io/exspire/commit/3d9953c90dcc0710dfc1e73d9e23bf8426a00b73))
* **ui:** Fix mobile swipe-to-reveal snapping back on touch end ([da7c736](https://github.com/meduseld-io/exspire/commit/da7c73678d7e11f0cbb2c31dbc38711ca608be9e))
* **ui:** Increase pull-to-refresh threshold to prevent accidental triggers ([0e5c3dd](https://github.com/meduseld-io/exspire/commit/0e5c3dded4449ac69edb3da9a5e2e7903197cd5a))
* **ui:** Make tower animation stagger adaptive to item count ([473ee73](https://github.com/meduseld-io/exspire/commit/473ee7381dda2c9596e9059a13b975dafbef5ea6))
* **ui:** Move pull-to-refresh indicator above app container ([0837c19](https://github.com/meduseld-io/exspire/commit/0837c19334122e8085d7e506b078488fe5c55a6c))
* **ui:** Play exit animation after delete confirmation, not on button press ([27d437d](https://github.com/meduseld-io/exspire/commit/27d437d9f209f20a0e95530a74072058ee081340))
* **ui:** Prevent iOS Safari auto-zoom on input focus ([ea96f34](https://github.com/meduseld-io/exspire/commit/ea96f34ac67934c5edb34493cb2129f53613608f))
* **ui:** Prevent swipe actions showing through expired items ([51517fc](https://github.com/meduseld-io/exspire/commit/51517fc93d6b256796ba038d26688cb5a769e6da))
* **ui:** Reduce vertical bounce on swipe-to-delete gesture ([08b6e01](https://github.com/meduseld-io/exspire/commit/08b6e011d0146ecf1daa4f2b8c52e255303bb35c))
* **ui:** Remove vertical bounce on swipe-to-delete ([ebd7e17](https://github.com/meduseld-io/exspire/commit/ebd7e17203e71b05c064e23ce862b690fb5ea841))
* **ui:** Show generic placeholder on sign-in password field ([5d9780a](https://github.com/meduseld-io/exspire/commit/5d9780a05a2ba844e3e1c26e2a0f0f501ad0981e))
* **ui:** Switch service worker to network-first for fresh deploys ([7802cb2](https://github.com/meduseld-io/exspire/commit/7802cb23f639a9167abee6eb39d84e1d561d6a87))
* **ui:** Update apple touch icon ([82155ff](https://github.com/meduseld-io/exspire/commit/82155ff807dddd05270a54a57cf79adf909bb57e))
* **ui:** Use touch-action none with manual scroll to eliminate vertical bounce ([5d87ac2](https://github.com/meduseld-io/exspire/commit/5d87ac2cd73d03c9128bdaf741f2b43333549a36))
* Update path-to-regexp to 0.1.13 to fix ReDoS vulnerability ([88731dc](https://github.com/meduseld-io/exspire/commit/88731dcfc78d96a186098b9ceb8c3660e85f880e))


### Performance

* **ui:** Smooth delete animation instead of full tower rebuild ([3c31e5e](https://github.com/meduseld-io/exspire/commit/3c31e5ee75762a7c949c299e73ba35cadbaebffe))


### Refactoring

* **ui:** Rename tower to spire across codebase ([a2f006e](https://github.com/meduseld-io/exspire/commit/a2f006e0e26e9be70b133acc5e9ded1aee954f65))


### Styling

* **docs:** Replace em dashes with single hyphens in README ([ff5008d](https://github.com/meduseld-io/exspire/commit/ff5008d26b945d83e7a2ab5dccd065e5f7319815))
* **ui:** Add staggered build-from-ground animation on tower filter changes ([d936c01](https://github.com/meduseld-io/exspire/commit/d936c01b8b18dab99bfc6a7587a564ef9cf473d3))
* **ui:** Capitalize category names instead of uppercase ([77caf59](https://github.com/meduseld-io/exspire/commit/77caf59c353adda8ce710b611923bd56d6f9b6f9))
* **ui:** Collapse filter chips into dropdown on mobile ([01fb716](https://github.com/meduseld-io/exspire/commit/01fb716b91af2b05aa01c61889fcc6c0581e5492))
* **ui:** Disable text selection cursor on app title ([893b7b8](https://github.com/meduseld-io/exspire/commit/893b7b8a5a2015ad66a533bb05760daba3f071fa))
* **ui:** Make pull-to-refresh spinner more visible ([77e4cff](https://github.com/meduseld-io/exspire/commit/77e4cffaa0387af92657b8db2b433b592cf20619))
* **ui:** Pin footer to bottom of page ([bccfa30](https://github.com/meduseld-io/exspire/commit/bccfa306f27550ab7163d677a29532d91d1a97cd))
* **ui:** Reduce mobile filter dropdown width to 50% ([bb7fbec](https://github.com/meduseld-io/exspire/commit/bb7fbece4c9c32d89d4e52dd76c96ee810613b99))
* **ui:** Revert chips and badges to uppercase, keep dropdown capitalize ([3520b9f](https://github.com/meduseld-io/exspire/commit/3520b9f8fd83f4052bbb00cd2223b4c428c0093c))
* **ui:** Update logo and add ExSpire title text to header ([f42f5ea](https://github.com/meduseld-io/exspire/commit/f42f5eaac802d4fa4197794af48ae2364dca8761))

## 0.1.0-alpha (2026-03-30)


### New Features

* add favicon ([555b260](https://github.com/meduseld-io/exspire/commit/555b260d594756f336310bbf0d09ab6e66a7ced2))
* Add swipe gestures, pull-to-refresh, dark/light theme, change password, delete account ([47b585c](https://github.com/meduseld-io/exspire/commit/47b585c744a397c1b414c8ec12ed57c0f0d63d11))
* **admin:** Add admin panel with user and item management ([d1b911d](https://github.com/meduseld-io/exspire/commit/d1b911d026d2998be60be2c12e20d447eae5c557))
* **admin:** Add admin panel with user list and item viewer ([3c0ca37](https://github.com/meduseld-io/exspire/commit/3c0ca37c971c24d14479b9ad6eabb58a83f7ca08))
* **app:** Initial ExSpire implementation ([ba2fcac](https://github.com/meduseld-io/exspire/commit/ba2fcacc7eb00149fb979df058663aa465167835))
* Auto-populate notification email from login email ([8f3fad0](https://github.com/meduseld-io/exspire/commit/8f3fad034d70b9c8d50c07ae76cfa2ae6b23a7a4))
* **items:** Add recurring items system ([35ff0f7](https://github.com/meduseld-io/exspire/commit/35ff0f7efd1081bc8f4c659fc58407584c9d8843))
* **notifications:** Add browser push notifications and PWA support ([e35de53](https://github.com/meduseld-io/exspire/commit/e35de53fb507e0eb96303fa3eb48ea0e52019ca8))
* **notifications:** Update sender to exspire@meduseld.io and add ExSpire link to email template ([7f641a8](https://github.com/meduseld-io/exspire/commit/7f641a8da3baa5582ce451c461599374e49e0ac1))
* Paginate tower list with show-more button after 21 items ([6eb6f33](https://github.com/meduseld-io/exspire/commit/6eb6f3302ff1037b933fe01dd7517ea5ac3ce304))
* Replace profile button with dropdown menu ([91f9a31](https://github.com/meduseld-io/exspire/commit/91f9a31df10fd7537992c5109b906717fb2a5202))
* **security:** Add input sanitization and validation ([0996c5c](https://github.com/meduseld-io/exspire/commit/0996c5cfd650732631a902150e85c8f609055108))
* **security:** Add rate limiting on auth endpoints ([5208ce1](https://github.com/meduseld-io/exspire/commit/5208ce10b10d0fee394e8841e652c7c955d10e7b))
* **ui:** Add category filter bar above the tower ([d72fb9a](https://github.com/meduseld-io/exspire/commit/d72fb9a8ebe629f958875345b5d653d7917b3480))
* **ui:** Add delete confirmation dialog, toast notifications, and category count badges ([e0e00cf](https://github.com/meduseld-io/exspire/commit/e0e00cf60d3654ed22e6b23ef5d8a2980da572b7))
* **ui:** Add inline search button to filter items by name ([69a4dde](https://github.com/meduseld-io/exspire/commit/69a4dde8d2198845f7f34908439173569964abb4))
* **ui:** Add mobile install banner prompting homescreen add ([0573191](https://github.com/meduseld-io/exspire/commit/0573191cf6d2db4004659b2b390689c462203f2f))
* **ui:** Add profile button with settings modal and notification type dropdown ([9db08fb](https://github.com/meduseld-io/exspire/commit/9db08fbee85039e5f92932f9c47453dfb0afac4e))
* **ui:** Add tap-to-expand on mobile cards to reveal edit/delete buttons ([9393329](https://github.com/meduseld-io/exspire/commit/93933290c6cbc5b708b1964802baf45189be1019))
* **ui:** Add test notification button for email template testing ([1b5e28e](https://github.com/meduseld-io/exspire/commit/1b5e28e77dde5199ddad43abe0b011ea325ba58d))
* **ui:** Add tower alignment setting (left, center, right) ([fccf56b](https://github.com/meduseld-io/exspire/commit/fccf56b31a0f4e00ab78125650d517a288ea2c30))
* **ui:** Inline editing replaces tower card in-place ([b772b84](https://github.com/meduseld-io/exspire/commit/b772b848e343121cae7b4e937c9745e0785163e5))
* **ui:** Replace 'other' category with custom category text input ([4015dad](https://github.com/meduseld-io/exspire/commit/4015dad63c7757c6872b8c3ac162915bf5c13c69))
* **ui:** Replace test button with dropdown for email and push testing ([898bfc8](https://github.com/meduseld-io/exspire/commit/898bfc8a3246034c6f282269bc7c2d83b9d32f9e))
* **ui:** Show years and months for expiry dates over 6 months ([65a5212](https://github.com/meduseld-io/exspire/commit/65a5212ce591d83731003476a75935ba7c1d3860))


### Bug Fixes

* Add loading state and feedback to verification email button ([f83e2b2](https://github.com/meduseld-io/exspire/commit/f83e2b20af5d79a6d3826e21e3161eba67bd395f))
* **api:** Add global rate limiter to all API routes ([2ef87c6](https://github.com/meduseld-io/exspire/commit/2ef87c68943483d7873b9aa56403814fa84725f4))
* **api:** Add rate limiter to SPA fallback route ([82fd9fa](https://github.com/meduseld-io/exspire/commit/82fd9fabf2bc86e56e486bd37a19ca61d5158ef9))
* **api:** Apply rate limiter directly to each route handler ([26f3bfc](https://github.com/meduseld-io/exspire/commit/26f3bfcd579427af210253dcf356eee6e63274ba))
* **backend:** Bump nodemailer to 8.x to fix addressparser DoS and SMTP injection ([11b36e0](https://github.com/meduseld-io/exspire/commit/11b36e088b5d346f46e01836195d5e5b58a1496c))
* **config:** Load env from /etc/exspire.env for root-only secrets ([176371d](https://github.com/meduseld-io/exspire/commit/176371d900edbba52c78e3761ffbcb40f2900c4a))
* **items:** Add expiry date validation on create and edit ([7fd6804](https://github.com/meduseld-io/exspire/commit/7fd6804d0c7680362c13147e2a80b8427fa6e3cc))
* Move modals and toasts outside app-container ([1e5d4d4](https://github.com/meduseld-io/exspire/commit/1e5d4d4dafebd0690992104a5f3b46ada08b7acd))
* **ui:** Admin-only test button, floating add FAB, mobile expired item display ([58d399a](https://github.com/meduseld-io/exspire/commit/58d399ae8079472250423a671005ffa110f4076a))
* **ui:** Fix janky vertical scrolling during swipe-to-delete on mobile ([3d9953c](https://github.com/meduseld-io/exspire/commit/3d9953c90dcc0710dfc1e73d9e23bf8426a00b73))
* **ui:** Fix mobile swipe-to-reveal snapping back on touch end ([da7c736](https://github.com/meduseld-io/exspire/commit/da7c73678d7e11f0cbb2c31dbc38711ca608be9e))
* **ui:** Increase pull-to-refresh threshold to prevent accidental triggers ([0e5c3dd](https://github.com/meduseld-io/exspire/commit/0e5c3dded4449ac69edb3da9a5e2e7903197cd5a))
* **ui:** Make tower animation stagger adaptive to item count ([473ee73](https://github.com/meduseld-io/exspire/commit/473ee7381dda2c9596e9059a13b975dafbef5ea6))
* **ui:** Move pull-to-refresh indicator above app container ([0837c19](https://github.com/meduseld-io/exspire/commit/0837c19334122e8085d7e506b078488fe5c55a6c))
* **ui:** Play exit animation after delete confirmation, not on button press ([27d437d](https://github.com/meduseld-io/exspire/commit/27d437d9f209f20a0e95530a74072058ee081340))
* **ui:** Prevent iOS Safari auto-zoom on input focus ([ea96f34](https://github.com/meduseld-io/exspire/commit/ea96f34ac67934c5edb34493cb2129f53613608f))
* **ui:** Prevent swipe actions showing through expired items ([51517fc](https://github.com/meduseld-io/exspire/commit/51517fc93d6b256796ba038d26688cb5a769e6da))
* **ui:** Reduce vertical bounce on swipe-to-delete gesture ([08b6e01](https://github.com/meduseld-io/exspire/commit/08b6e011d0146ecf1daa4f2b8c52e255303bb35c))
* **ui:** Remove vertical bounce on swipe-to-delete ([ebd7e17](https://github.com/meduseld-io/exspire/commit/ebd7e17203e71b05c064e23ce862b690fb5ea841))
* **ui:** Show generic placeholder on sign-in password field ([5d9780a](https://github.com/meduseld-io/exspire/commit/5d9780a05a2ba844e3e1c26e2a0f0f501ad0981e))
* **ui:** Switch service worker to network-first for fresh deploys ([7802cb2](https://github.com/meduseld-io/exspire/commit/7802cb23f639a9167abee6eb39d84e1d561d6a87))
* **ui:** Update apple touch icon ([82155ff](https://github.com/meduseld-io/exspire/commit/82155ff807dddd05270a54a57cf79adf909bb57e))
* **ui:** Use touch-action none with manual scroll to eliminate vertical bounce ([5d87ac2](https://github.com/meduseld-io/exspire/commit/5d87ac2cd73d03c9128bdaf741f2b43333549a36))
* Update path-to-regexp to 0.1.13 to fix ReDoS vulnerability ([88731dc](https://github.com/meduseld-io/exspire/commit/88731dcfc78d96a186098b9ceb8c3660e85f880e))


### Performance

* **ui:** Smooth delete animation instead of full tower rebuild ([3c31e5e](https://github.com/meduseld-io/exspire/commit/3c31e5ee75762a7c949c299e73ba35cadbaebffe))


### Refactoring

* **ui:** Rename tower to spire across codebase ([a2f006e](https://github.com/meduseld-io/exspire/commit/a2f006e0e26e9be70b133acc5e9ded1aee954f65))


### Styling

* **ui:** Add staggered build-from-ground animation on tower filter changes ([d936c01](https://github.com/meduseld-io/exspire/commit/d936c01b8b18dab99bfc6a7587a564ef9cf473d3))
* **ui:** Capitalize category names instead of uppercase ([77caf59](https://github.com/meduseld-io/exspire/commit/77caf59c353adda8ce710b611923bd56d6f9b6f9))
* **ui:** Collapse filter chips into dropdown on mobile ([01fb716](https://github.com/meduseld-io/exspire/commit/01fb716b91af2b05aa01c61889fcc6c0581e5492))
* **ui:** Disable text selection cursor on app title ([893b7b8](https://github.com/meduseld-io/exspire/commit/893b7b8a5a2015ad66a533bb05760daba3f071fa))
* **ui:** Make pull-to-refresh spinner more visible ([77e4cff](https://github.com/meduseld-io/exspire/commit/77e4cffaa0387af92657b8db2b433b592cf20619))
* **ui:** Pin footer to bottom of page ([bccfa30](https://github.com/meduseld-io/exspire/commit/bccfa306f27550ab7163d677a29532d91d1a97cd))
* **ui:** Reduce mobile filter dropdown width to 50% ([bb7fbec](https://github.com/meduseld-io/exspire/commit/bb7fbece4c9c32d89d4e52dd76c96ee810613b99))
* **ui:** Revert chips and badges to uppercase, keep dropdown capitalize ([3520b9f](https://github.com/meduseld-io/exspire/commit/3520b9f8fd83f4052bbb00cd2223b4c428c0093c))
* **ui:** Update logo and add ExSpire title text to header ([f42f5ea](https://github.com/meduseld-io/exspire/commit/f42f5eaac802d4fa4197794af48ae2364dca8761))
