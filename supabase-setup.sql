-- 创建应用状态表（单行存储，最简单的 localStorage 云端替代）
create table app_state (
  id int primary key default 1 check (id = 1),
  gems int default 0,
  tasks jsonb default '[]',
  rewards jsonb default '[]',
  submissions jsonb default '[]',
  completed_today jsonb default '[]',
  redeemed_rewards jsonb default '[]',
  updated_at timestamptz default now()
);

-- 插入初始行
insert into app_state (id, gems, tasks, rewards, submissions, completed_today, redeemed_rewards)
values (1, 0,
  '[
    {"id":1,"name":"刷牙洗脸","icon":"🪥","description":"早起第一件事，把小脸洗得干干净净，牙齿刷得亮晶晶！","gems":10,"color":"#a8e6cf"},
    {"id":2,"name":"整理书包","icon":"🎒","description":"检查课本、文具都带齐了吗？整整齐齐放进书包里！","gems":10,"color":"#a8d8ea"},
    {"id":3,"name":"认读汉字","icon":"📖","description":"今天来认识5个新的汉字朋友吧！大声读出来哦～","gems":15,"color":"#ffd3b6"},
    {"id":4,"name":"跳绳500下","icon":"🤸","description":"跳起来！500下跳绳让身体变得棒棒的！可以分几次完成哦～","gems":20,"color":"#ffaaa5"}
  ]',
  '[
    {"id":1,"name":"看动画片15分钟","icon":"📺","cost":20,"color":"#a8d8ea"},
    {"id":2,"name":"公园野餐","icon":"🧺","cost":200,"color":"#a8e6cf"},
    {"id":3,"name":"选一个小贴纸","icon":"⭐","cost":10,"color":"#ffd3b6"},
    {"id":4,"name":"睡前多听一个故事","icon":"🌙","cost":15,"color":"#c4b5fd"}
  ]',
  '[]', '[]', '[]'
);

-- 开启 RLS 并允许所有人读写（家庭内部使用，简单策略）
alter table app_state enable row level security;

create policy "Allow all read" on app_state for select using (true);
create policy "Allow all update" on app_state for update using (true);
create policy "Allow all insert" on app_state for insert with check (true);
