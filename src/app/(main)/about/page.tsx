import React from 'react';
import Link from 'next/link';

// Timeline milestones data
const milestones = [
  {
    year: '2018',
    title: 'Ý tưởng',
    subtitle: 'Cách du lịch mới',
    description: 'StayEasy ra đời từ mong muốn làm cho việc tìm kiếm và đặt phòng trở nên đơn giản, cá nhân hóa và thực sự thú vị.',
    icon: 'lightbulb',
  },
  {
    year: '2019',
    title: 'Khởi động',
    subtitle: 'Đặt phòng đầu tiên',
    description: 'Chúng tôi chính thức ra mắt nền tảng và chào đón vị khách hạnh phúc đầu tiên, đánh dấu sự khởi đầu của hành trình.',
    icon: 'rocket_launch',
  },
  {
    year: '2021',
    title: 'Cùng phát triển',
    subtitle: '10.000 khách hài lòng',
    description: 'Cộng đồng của chúng tôi phát triển, đạt cột mốc quan trọng thúc đẩy niềm đam mê mở rộng và cải thiện dịch vụ.',
    icon: 'groups',
  },
  {
    year: '2023',
    title: 'Vươn ra toàn cầu',
    subtitle: 'Vượt qua biên giới',
    description: 'StayEasy mở rộng danh sách đến hơn 50 quốc gia, thực sự kết nối du khách với thế giới.',
    icon: 'public',
  },
];

// Core values data
const coreValues = [
  {
    icon: 'favorite',
    title: 'Khách hàng là trên hết',
    description: 'Khách hàng là trung tâm của mọi việc chúng tôi làm. Sự thoải mái và hài lòng của họ là ưu tiên hàng đầu.',
  },
  {
    icon: 'gesture',
    title: 'Đơn giản',
    description: 'Chúng tôi tin vào việc làm cho du lịch trở nên dễ dàng. Từ tìm kiếm đến đặt phòng, chúng tôi hướng đến trải nghiệm liền mạch.',
  },
  {
    icon: 'shield',
    title: 'Tin cậy',
    description: 'Chúng tôi cam kết trở thành nền tảng đáng tin cậy và minh bạch cho cộng đồng du khách và chủ nhà.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div
              className="flex min-h-[480px] flex-col gap-8 rounded-xl items-center justify-center bg-cover bg-center bg-no-repeat p-10 text-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80")`,
              }}
            >
              <div className="flex flex-col gap-4 max-w-3xl">
                <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Hành trình đến sự thoải mái bắt đầu từ đây.
                </h1>
                <p className="text-white/90 text-base font-normal leading-normal md:text-lg">
                  Khám phá cam kết của chúng tôi về lòng hiếu khách xuất sắc và cách chúng tôi biến mỗi kỳ nghỉ thành trải nghiệm đáng nhớ, bởi vì chúng tôi tin rằng du lịch nên dễ dàng và phong phú.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold leading-tight tracking-tight">Sứ mệnh & Tầm nhìn</h2>
              <p className="opacity-50 mt-2 max-w-2xl mx-auto">
                Động lực đằng sau mỗi kỳ nghỉ chúng tôi tuyển chọn và mỗi trải nghiệm chúng tôi mang đến.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="flex flex-col items-stretch justify-start rounded-xl bg-background-light shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <div
                  className="w-full bg-center bg-no-repeat aspect-[16/7] bg-cover rounded-t-xl"
                  style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80")`,
                  }}
                />
                <div className="flex w-full grow flex-col items-start justify-center gap-3 p-6">
                  <h3 className="text-xl font-bold leading-tight tracking-tight">Sứ mệnh</h3>
                  <p className="opacity-60 text-base font-normal leading-relaxed">
                    Mang đến trải nghiệm đặt phòng liền mạch và thoải mái, kết nối du khách với ngôi nhà hoàn hảo xa nhà. Chúng tôi tận tâm với chất lượng, sự đơn giản và đặt khách hàng lên hàng đầu trong mọi việc.
                  </p>
                </div>
              </div>
              {/* Vision Card */}
              <div className="flex flex-col items-stretch justify-start rounded-xl bg-background-light shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <div
                  className="w-full bg-center bg-no-repeat aspect-[16/7] bg-cover rounded-t-xl"
                  style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80")`,
                  }}
                />
                <div className="flew-full grow flex-col items-start justify-center gap-3 p-6">
                  <h3 className="text-xl font-bold leading-tight tracking-tight">Tầm nhìn</h3>
                  <p className="opacity-60 text-base font-normal leading-relaxed">
                    Trở thành nền tảng đáng tin cậy và được yêu thích nhất cho du khách tìm kiếm chỗ ở độc đáo và thoải mái trên toàn thế giới. Chúng tôi hướng đến một thế giới nơi mọi người có thể du lịch dễ dàng và tự tin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section - Timeline */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">Câu chuyện của chúng tôi</h2>
            <p className="opacity-50 mt-2">Từ một ý tưởng đơn giản đến người bạn đồng hành du lịch đáng tin cậy.</p>
          </div>
          <div className="relative mx-auto mt-12 max-w-4xl px-4">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-primary/20 -translate-x-1/2" />

            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative mb-8 flex w-full items-center justify-between ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="hidden md:block w-5/12" />
                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                  <span className="material-symbols-outlined text-base">{milestone.icon}</span>
                </div>
                <div className="w-full rounded-xl bg-white p-6 shadow-md md:w-5/12 ml-4 md:ml-0">
                  <p className="text-sm font-semibold text-primary">{milestone.year} - {milestone.title}</p>
                  <h3 className="mt-1 font-bold">{milestone.subtitle}</h3>
                  <p className="mt-2 text-sm opacity-60">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold leading-tight tracking-tight">Giá trị cốt lõi</h2>
              <p className="opacity-50 mt-2 max-w-2xl mx-auto">
                Những nguyên tắc định hướng quyết định và định hình văn hóa của chúng tôi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value) => (
                <div key={value.title} className="text-center p-8 rounded-xl bg-background-light">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <span className="material-symbols-outlined text-3xl">{value.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 opacity-60">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-xl bg-primary p-12 text-center text-white">
              <h2 className="text-3xl font-bold">Sẵn sàng cho kỳ nghỉ tiếp theo?</h2>
              <p className="mt-2 mb-8 max-w-xl mx-auto opacity-90">
                Tham gia cùng hàng ngàn du khách hạnh phúc và tìm ngôi nhà hoàn hảo xa nhà với StayEasy.
              </p>
              <Link
                href="/rooms"
                className="inline-flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white text-primary text-base font-bold tracking-wide hover:bg-gray-100 transition-colors"
              >
                <span className="truncate">Đặt phòng ngay</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
