# Connection focus

A visible dApp can lose document focus while its developer tools are focused.
On refresh or hot reload, an unfocused provider sends a silent connection request.
The background resumes only an existing authorization with an available account;
it never opens the wallet or queues an approval for a silent request. A missing
or expired authorization returns a null connection response. This background
check also covers authorization changes after the dApp's preauthorization check.

Hidden, unfocused documents are rejected before sending a connection request.
Focused documents retain the interactive connection flow. Signing continues to
require focus and a matching connected account. There is no localhost exception.

The provider tests cover fresh provider instances after reload, focus, visibility
and signing rejection. Background tests cover authorized reconnect, revoked
permission, missing accounts and the ordinary interactive approval flow.
