// ===============================
// AUTH
// ===============================
async function checkAuth() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'admin.html';
      return;
    }

    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) {
      await auth.signOut();
      window.location.href = 'admin.html';
    }
  });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = 'admin.html';
  });
}

// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
  const usersSnap = await db.collection('users').get();
  const withdrawalsSnap = await db
    .collection('withdrawals')
    .where('status', '==', 'pending')
    .get();

  let totalBalance = 0;
  let bannedUsers = 0;

  usersSnap.forEach(doc => {
    totalBalance += doc.data().balance || 0;
    if (doc.data().banned) bannedUsers++;
  });

  document.getElementById('totalUsers').textContent = usersSnap.size;
  document.getElementById('pendingWithdrawals').textContent = withdrawalsSnap.size;
  document.getElementById('totalBalance').textContent = `R$ ${totalBalance.toFixed(2)}`;
  document.getElementById('bannedUsers').textContent = bannedUsers;
}

// ===============================
// USERS
// ===============================
async function loadUsers() {
  const snap = await db.collection('users').get();
  const table = document.getElementById('usersTable');

  if (snap.empty) {
    table.innerHTML = `<tr><td colspan="4">Nenhum usuário encontrado</td></tr>`;
    return;
  }

  table.innerHTML = snap.docs.map(doc => {
    const u = doc.data();
    return `
      <tr>
        <td>${u.email || '—'}</td>
        <td>R$ ${(u.balance || 0).toFixed(2)}</td>
        <td>${u.banned ? 'Banido' : 'Ativo'}</td>
        <td>
          <button onclick="toggleBan('${doc.id}', ${!!u.banned})">
            ${u.banned ? 'Desbanir' : 'Banir'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleBan(userId, banned) {
  await db.collection('users').doc(userId).update({
    banned: !banned
  });
  loadUsers();
}

// ===============================
// WITHDRAWALS
// ===============================
async function loadWithdrawals() {
  const snap = await db.collection('withdrawals').get();
  const table = document.getElementById('withdrawalsTable');

  if (snap.empty) {
    table.innerHTML = `<tr><td colspan="4">Nenhum saque encontrado</td></tr>`;
    return;
  }

  table.innerHTML = snap.docs.map(doc => {
    const w = doc.data();
    return `
      <tr>
        <td>${w.email || '—'}</td>
        <td>R$ ${(w.amount || 0).toFixed(2)}</td>
        <td>${w.status}</td>
        <td>
          ${w.status === 'pending'
            ? `<button onclick="approveWithdrawal('${doc.id}')">Aprovar</button>`
            : '—'}
        </td>
      </tr>
    `;
  }).join('');
}

async function approveWithdrawal(id) {
  await db.collection('withdrawals').doc(id).update({
    status: 'approved',
    approvedAt: new Date()
  });

  loadWithdrawals();
}