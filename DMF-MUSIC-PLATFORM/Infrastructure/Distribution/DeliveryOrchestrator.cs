using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMF_MUSIC_PLATFORM.Data.Distribution;
using Google.Cloud.Firestore;

namespace DMF_MUSIC_PLATFORM.Infrastructure.Distribution
{
    /// <summary>
    /// Orchestrates delivery of releases to DSPs.
    /// </summary>
    public interface IDeliveryOrchestrator
    {
        Task QueueDeliveriesAsync(Release release, List<string> selectedDsps);
        Task<List<Delivery>> GetDeliveriesAsync(string releaseId);
        Task UpdateDeliveryStatusAsync(string deliveryId, string newStatus, string? error = null);
    }

    public class DeliveryOrchestrator : IDeliveryOrchestrator
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<DeliveryOrchestrator> _logger;

        public DeliveryOrchestrator(FirestoreDb firestore, ILogger<DeliveryOrchestrator> logger)
        {
            _firestore = firestore;
            _logger = logger;
        }

        public async Task QueueDeliveriesAsync(Release release, List<string> selectedDsps)
        {
            try
            {
                var deliveries = new List<Delivery>();

                foreach (var dsp in selectedDsps)
                {
                    var delivery = new Delivery
                    {
                        ReleaseId = release.Id,
                        Dsp = dsp.ToLower(),
                        Status = "QUEUED",
                        DedupeKey = $"{release.Id}_{dsp}_{release.UpdatedAt:yyyyMMddHHmmss}"
                    };

                    await _firestore.Collection("deliveries").Document(delivery.Id).SetAsync(delivery);
                    deliveries.Add(delivery);

                    _logger.LogInformation($"Queued delivery: {delivery.Id} ({dsp})");
                }

                // Update release status
                await _firestore.Collection("releases").Document(release.Id).UpdateAsync("status", "SCHEDULED");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error queuing deliveries");
                throw;
            }
        }

        public async Task<List<Delivery>> GetDeliveriesAsync(string releaseId)
        {
            try
            {
                var query = _firestore.Collection("deliveries")
                    .WhereEqualTo("releaseId", releaseId);

                var snapshot = await query.GetSnapshotAsync();
                var deliveries = snapshot.Documents
                    .Select(doc => doc.ConvertTo<Delivery>())
                    .ToList();

                return deliveries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching deliveries");
                return new List<Delivery>();
            }
        }

        public async Task UpdateDeliveryStatusAsync(string deliveryId, string newStatus, string? error = null)
        {
            try
            {
                var updates = new Dictionary<string, object>
                {
                    { "status", newStatus },
                    { "updatedAt", DateTime.UtcNow }
                };

                if (!string.IsNullOrEmpty(error))
                {
                    updates.Add("lastError", error);
                }

                if (newStatus == "SENT")
                {
                    updates.Add("sentAt", DateTime.UtcNow);
                }
                else if (newStatus == "ACK")
                {
                    updates.Add("acknowledgedAt", DateTime.UtcNow);
                }

                await _firestore.Collection("deliveries").Document(deliveryId).UpdateAsync(updates);

                _logger.LogInformation($"Updated delivery {deliveryId}: {newStatus}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating delivery status");
                throw;
            }
        }
    }
}
