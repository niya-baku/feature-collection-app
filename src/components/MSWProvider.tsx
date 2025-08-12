'use client';

import { useEffect, useState } from 'react';

interface MSWProviderProps {
	children: React.ReactNode;
}

export default function MSWProvider({ children }: MSWProviderProps) {
	const [mswReady, setMswReady] = useState(false);

	useEffect(() => {
		const initMSW = async () => {
			if (
				process.env.NODE_ENV === 'development' &&
				process.env.NEXT_PUBLIC_MSW_ENABLED === 'true'
			) {
				if (typeof window === 'undefined') {
					const { server } = await import('@/mocks/server');
					await server.listen();
				} else {
					const { worker } = await import('@/mocks/browser');
					await worker.start({
						onUnhandledRequest: 'warn',
						serviceWorker: { url: '/mockServiceWorker.js' },
					});
				}
			}
			setMswReady(true);
		};

		initMSW();
	}, []);

	return mswReady ? <>{children}</> : null;
}
