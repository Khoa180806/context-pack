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
  'phan trang': ['pagination', 'page', 'limit', 'offset'],
  'thong bao': ['notify', 'notification', 'alert', 'message'],
  'tin nhan': ['message', 'chat', 'inbox'],
  'trang thai': ['status', 'state', 'condition'],
  'cau hinh': ['config', 'configuration', 'settings', 'env'],
  'kich hoat': ['activate', 'enable', 'trigger'],
  'vo hieu hoa': ['deactivate', 'disable'],
  'dem': ['count', 'total', 'length'],

  // Files & Media
  'tap tin': ['file', 'document', 'asset'],
  'thu muc': ['dir', 'directory', 'folder', 'path'],
  'tai len': ['upload', 'import', 'multipart'],
  'tai ve': ['download', 'export', 'fetch'],
  'hinh anh': ['image', 'photo', 'picture', 'avatar', 'thumb'],
  'kich thuoc': ['size', 'length', 'dimension'],
  'dinh dang': ['format', 'extension', 'type'],
  'nen': ['compress', 'zip', 'archive'],
  'giai nen': ['uncompress', 'unzip', 'extract'],
  'doc': ['read', 'parse', 'scan'],
  'ghi': ['write', 'append', 'output'],

  // Errors & Debugging
  'loi': ['error', 'exception', 'fault'],
  'sua loi': ['fix', 'bug', 'patch', 'resolve', 'solve'],
  'ngoai le': ['exception', 'error', 'catch'],
  'kiem tra': ['check', 'validate', 'verify', 'assert', 'test'],
  'kiem thu': ['test', 'spec', 'mock', 'stub'],
  'ghi log': ['log', 'logger', 'trace', 'debug'],
  'canh bao': ['warn', 'warning', 'alert'],
  'that bai': ['fail', 'failure', 'rejected'],
  'thanh cong': ['success', 'ok', 'resolved'],
  'khong tim thay': ['not_found', '404', 'missing'],
  'tre': ['timeout', 'delay', 'latency'],
  'tai lai': ['reload', 'refresh', 'retry'],

  // E-commerce & Payments
  'thanh toan': ['payment', 'checkout', 'pay', 'stripe', 'paypal'],
  'don hang': ['order', 'purchase', 'invoice'],
  'gio hang': ['cart', 'basket'],
  'san pham': ['product', 'item', 'goods'],
  'gia': ['price', 'amount', 'cost'],
  'giam gia': ['discount', 'coupon', 'voucher', 'promo'],
  'van chuyen': ['shipping', 'delivery', 'transport'],
  'khach hang': ['customer', 'client', 'buyer'],
  'hoa don': ['invoice', 'bill', 'receipt'],
  'hoan tien': ['refund', 'reimburse'],
  'tien te': ['currency', 'usd', 'vnd'],

  // Architecture & DevOps
  'dich vu': ['service', 'provider', 'daemon'],
  'kho luu tru': ['repository', 'repo', 'storage'],
  'dieu khien': ['controller', 'handler', 'action'],
  'thanh phan': ['component', 'widget', 'element'],
  'mo hinh': ['model', 'schema', 'entity'],
  'giao dien': ['interface', 'ui', 'view', 'layout'],
  'tien ich': ['util', 'utility', 'helper', 'tool'],
  'su kien': ['event', 'listener', 'emitter', 'trigger'],
  'hang doi': ['queue', 'job', 'worker', 'task'],
  'tien trinh': ['process', 'thread', 'pipeline'],
  'khoi tao': ['init', 'initialize', 'setup', 'bootstrap'],
  'trien khai': ['deploy', 'deployment', 'release', 'publish'],
  'dong goi': ['pack', 'bundle', 'build', 'package'],
  'tai su dung': ['reuse', 'reusable', 'shared'],
  'gioi han': ['limit', 'bound', 'throttle', 'rate_limit'],
  'giam sat': ['monitor', 'metric', 'telemetry', 'trace'],
  'an toan': ['security', 'secure', 'guard', 'protect'],
};

/**
 * Remove Vietnamese tonal accents and normalize to ASCII.
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}
