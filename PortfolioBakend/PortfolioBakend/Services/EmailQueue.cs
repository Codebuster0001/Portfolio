using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace PortfolioBakend.Services
{
    public class EmailMessage
    {
        public string ToEmail { get; set; }
        public string Subject { get; set; }
        public string HtmlMessage { get; set; }
    }

    public interface IEmailQueue
    {
        void EnqueueEmail(EmailMessage message);
        Task<EmailMessage> DequeueEmailAsync(CancellationToken cancellationToken);
    }

    public class EmailQueue : IEmailQueue
    {
        private readonly ConcurrentQueue<EmailMessage> _workItems = new();
        private readonly SemaphoreSlim _signal = new(0);

        public void EnqueueEmail(EmailMessage message)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));
            _workItems.Enqueue(message);
            _signal.Release();
        }

        public async Task<EmailMessage> DequeueEmailAsync(CancellationToken cancellationToken)
        {
            await _signal.WaitAsync(cancellationToken);
            _workItems.TryDequeue(out var workItem);
            return workItem;
        }
    }
}
