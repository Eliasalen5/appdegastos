const CACHE_NAME = 'gastos-v1';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if ('focus' in client) return client.focus();
                }
                return clients.openWindow('/');
            })
    );
});

self.addEventListener('push', event => {
    const options = {
        body: '¡No olvides registrar tus gastos del día!',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'recordatorio-gastos',
        renotify: true,
        actions: [
            { action: 'open', title: 'Abrir' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Recordatorio de Gastos', options)
    );
});
