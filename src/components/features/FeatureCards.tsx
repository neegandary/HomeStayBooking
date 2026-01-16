import React from 'react';

const features = [
  {
    icon: 'spark',
    title: 'Bất động sản độc đáo',
    description: 'Mỗi homestay đều được tuyển chọn kỹ lưỡng về tính độc đáo và chất lượng.',
  },
  {
    icon: 'headset_mic',
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc.',
  },
  {
    icon: 'verified',
    title: 'Đảm bảo giá tốt nhất',
    description: 'Chúng tôi đảm bảo bạn nhận được giá trị tốt nhất cho kỳ nghỉ, không có phí ẩn.',
  },
];

const FeatureCards = () => {
  return (
    <section className="flex flex-col gap-10 px-4 py-20 @container">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-primary text-3xl font-black uppercase tracking-tight sm:text-4xl max-w-[720px]">
            SỰ KHÁC BIỆT CỦA STAYEASY
          </h1>
          <p className="text-primary/70 text-base font-normal leading-normal max-w-[720px]">
            Khám phá lý do đặt phòng với chúng tôi giúp trải nghiệm du lịch của bạn trở nên liền mạch và đáng nhớ.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-1 gap-4 rounded-2xl border border-primary/10 bg-white p-6 flex-col shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow"
            >
              <span className="material-symbols-outlined text-action text-3xl">
                {feature.icon}
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-primary text-lg font-bold leading-tight">
                  {feature.title}
                </h2>
                <p className="text-muted text-sm font-normal leading-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
