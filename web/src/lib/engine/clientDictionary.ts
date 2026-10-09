/**
 * Vietnamese to English technical programming synonym dictionary.
 * Supports query expansion for Vietnamese developer prompts against English source code.
 */
export const VI_EN_SYNONYMS: Record<string, string[]> = {
  // Authentication & Authorization
  'dang nhap': ['login', 'signin', 'auth', 'session'],
  'dang xuat': ['logout', 'signout'],
  'dang ky': ['register', 'signup', 'enroll'],
  'xac thuc': ['auth', 'authenticate', 'verify', 'token', 'jwt'],
  'phan quyen': ['authorize', 'permission', 'role', 'acl', 'access'],
  'mat khau': ['password', 'secret', 'passphrase'],
  'quen mat khau': ['forgot_password', 'reset_password'],
  'tai khoan': ['account', 'user', 'profile'],
  'nguoi dung': ['user', 'member', 'client'],
  'vai tro': ['role', 'permission'],
  'khoa': ['lock', 'block', 'ban', 'key'],
  'mo khoa': ['unlock', 'unban'],

  // Database & Storage
  'co so du lieu': ['database', 'db', 'storage'],
  'bang': ['table', 'schema', 'entity', 'collection'],
  'cot': ['column', 'field', 'attribute'],
  'dong': ['row', 'record', 'entry'],
  'truy van': ['query', 'select', 'find', 'search'],
  'luu': ['save', 'store', 'insert', 'create', 'persist'],
  'cap nhat': ['update', 'modify', 'patch', 'edit'],
  'xoa': ['delete', 'remove', 'destroy', 'drop', 'purge'],
  'khoa chinh': ['primary_key', 'id'],
  'khoa ngoai': ['foreign_key', 'relation', 'ref'],
  'chi muc': ['index', 'indexing'],
  'giao dich': ['transaction', 'tx', 'commit', 'rollback'],
  'bo nho dem': ['cache', 'redis', 'memcached'],
  'sao luu': ['backup', 'dump', 'snapshot'],
  'khoi phuc': ['restore', 'recover'],

  // API & Networking
  'yeu cau': ['request', 'req', 'payload'],
  'phan hoi': ['response', 'res', 'reply'],
  'duong dan': ['route', 'path', 'endpoint', 'url'],
  'cong ket noi': ['port', 'socket', 'gateway'],
  'tieu de': ['header', 'title', 'heading'],
  'tham so': ['param', 'parameter', 'argument', 'query'],
  'tai lieu': ['doc', 'documentation', 'spec', 'swagger'],
  'trung gian': ['middleware', 'interceptor', 'proxy'],
  'dieu huong': ['router', 'redirect', 'navigate'],
  'dong bo': ['sync', 'synchronous', 'realtime'],
  'bat dong bo': ['async', 'asynchronous', 'await', 'promise'],
  'ket noi': ['connect', 'connection', 'link'],
  'ngat ket noi': ['disconnect', 'close'],
  'tai nguyen': ['resource', 'asset', 'endpoint'],
  'phien ban': ['version', 'v1', 'v2', 'release'],

  // CRUD & Business Logic
  'danh sach': ['list', 'index', 'all', 'collection', 'get_all'],
  'chi tiet': ['detail', 'show', 'view', 'get_by_id'],
  'tao moi': ['create', 'new', 'add', 'insert', 'init'],
  'chinh sua': ['edit', 'modify', 'update'],
  'tim kiem': ['search', 'find', 'filter', 'lookup'],
  'loc': ['filter', 'criteria', 'condition'],
  'sap xep': ['sort', 'order', 'arrange'],
  'kiem tra': ['check', 'validate', 'verify', 'test', 'assert'],
  'loi': ['error', 'exception', 'failure', 'bug'],
  'thanh cong': ['success', 'ok', 'pass', 'done'],
  'that bai': ['fail', 'failure', 'reject'],
  'thong bao': ['notification', 'alert', 'message', 'notify'],
  'cai dat': ['config', 'configuration', 'setting', 'setup', 'options'],
  'trang thai': ['status', 'state'],

  // Architecture & Coding Patterns
  'ham': ['function', 'method', 'fn', 'handler'],
  'lop': ['class', 'struct', 'interface', 'type'],
  'bien': ['variable', 'var', 'const', 'let'],
  'hang so': ['constant', 'const'],
  'module': ['module', 'package', 'bundle', 'component'],
  'thu vien': ['library', 'lib', 'dependency'],
  'khung lam viec': ['framework'],
  'dich vu': ['service', 'provider'],
  'kho luu tru': ['repository', 'repo', 'store'],
  'dieu khien': ['controller', 'handler', 'resolver'],
  'thuc the': ['entity', 'model'],
  'kiem thu': ['test', 'spec', 'mock', 'stub', 'suite'],
  'tai cau truc': ['refactor', 'cleanup', 'simplify'],
  'trien khai': ['deploy', 'implement', 'execute'],
  'dong goi': ['pack', 'package', 'bundle', 'build'],
  'trich xuat': ['extract', 'slice', 'parse'],
  'dem token': ['count_tokens', 'tokenize', 'bpe', 'tiktoken'],
  'ngan sach': ['budget', 'limit', 'threshold', 'quota'],
};

/**
 * Converts Vietnamese accented characters to plain ASCII characters.
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .trim();
}
